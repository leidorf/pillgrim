import { useEffect, useRef } from "react";
import { AppState, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import i18n, { getSystemLanguage } from "./utils/i18n";
import {
  AddMedicationParamList,
  MainScreenParamList,
  RootStackParamList,
  SettingsParamList,
} from "./types/navigation";

import HouseIcon from "./assets/icons/house.svg";
import PillIcon from "./assets/icons/pill.svg";
import CalendarIcon from "./assets/icons/calendar.svg";
import Step2Screen from "./screens/AddMedication/Step2Screen/Step2Screen";
import Step3Screen from "./screens/AddMedication/Step3Screen/Step3Screen";
import Step4Screen from "./screens/AddMedication/Step4Screen/Step4Screen";
import CalendarScreen from "./screens/CalendarScreen";

import HomeScreen from "./screens/HomeScreen";
import MedsScreen from "./screens/MedsScreen";
import Step1Screen from "./screens/AddMedication/Step1Screen/Step1Screen";
import SettingsScreen from "./screens/Settings";

import { getNavigationTheme } from "./theme/theme";
import { useAppTheme } from "./theme/useAppTheme";
import { useSettingsStore } from "./store/settingsStore";
import { useMedicationStore } from "./store/medicationStore";
import {
  rescheduleAllNotifications,
  onForegroundNotificationEvent,
  getInitialNotificationResponse,
  clearInitialNotificationResponse,
  setupNotificationHandler,
  processNotificationAction,
} from "./services/notificationService";

/* ---------------------- Navigators ---------------------- */
const Tab = createBottomTabNavigator<MainScreenParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AddMedStack = createNativeStackNavigator<AddMedicationParamList>();

const MainTabs = () => {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarStyle: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderTopWidth: 0,
          boxShadow: "none",
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <HouseIcon height={24} width={24} stroke={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Meds"
        component={MedsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <PillIcon height={24} width={24} stroke={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <CalendarIcon height={24} width={24} stroke={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AddMedicationNavigator = () => {
  return (
    <AddMedStack.Navigator screenOptions={{ headerShown: false }}>
      <AddMedStack.Screen name="Step1" component={Step1Screen} />
      <AddMedStack.Screen name="Step2" component={Step2Screen} />
      <AddMedStack.Screen name="Step3" component={Step3Screen} />
      <AddMedStack.Screen name="Step4" component={Step4Screen} />
    </AddMedStack.Navigator>
  );
};

const SettingsStack = createNativeStackNavigator<SettingsParamList>();

import NotificationsScreen from "./screens/Settings/NotificationsScreen";
import AlarmScreen from "./screens/Settings/AlarmScreen";
import AppearanceScreen from "./screens/Settings/AppearanceScreen";
import LanguageScreen from "./screens/Settings/LanguageScreen";

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <SettingsStack.Screen name="Alarm" component={AlarmScreen} />
      <SettingsStack.Screen name="Appearance" component={AppearanceScreen} />
      <SettingsStack.Screen name="Language" component={LanguageScreen} />
    </SettingsStack.Navigator>
  );
}

export default function App() {
  const theme = useAppTheme();
  const isDarkMode = theme.background === "#101410";

  const language = useSettingsStore((s) => s.language);
  useEffect(() => {
    const resolved = language === "system" ? getSystemLanguage() : language;
    i18n.changeLanguage(resolved);
  }, []);

  const medications = useMedicationStore((s) => s.medications);
  const _updateMedicationNotificationIds = useMedicationStore(
    (s) => s._updateMedicationNotificationIds,
  );
  const isRescheduling = useRef(false);
  const pendingReschedule = useRef(false);
  const prevSchedulingHash = useRef<string>("");

  // Setup foreground notification handler (only once)
  useEffect(() => {
    setupNotificationHandler();
  }, []);

  useEffect(() => {
    const doReschedule = async () => {
      if (isRescheduling.current) {
        pendingReschedule.current = true;
        return;
      }

      const freshMeds = useMedicationStore.getState().medications;
      if (freshMeds.length === 0) return;

      isRescheduling.current = true;
      pendingReschedule.current = false;
      try {
        await rescheduleAllNotifications(
          freshMeds,
          (id) =>
            useMedicationStore.getState().medications.find((m) => m.id === id)
              ?.notificationIds ?? [],
          (id, ids) => _updateMedicationNotificationIds(id, ids),
        );
      } catch (error) {
        console.error("Failed to reschedule notifications:", error);
      } finally {
        isRescheduling.current = false;
        if (pendingReschedule.current) {
          pendingReschedule.current = false;
          doReschedule();
        }
      }
    };

    // Reschedule only when scheduling-relevant properties change
    // (avoids infinite loop: notificationIds updates don't trigger re-schedule)
    const schedulingHash = JSON.stringify(
      medications
        .filter((m) => m.isActive && m.notificationSettings?.enabled !== false)
        .map((m) => ({
          id: m.id,
          schedule: m.schedule,
          timeDoses: m.timeDoses,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );

    if (schedulingHash !== prevSchedulingHash.current) {
      prevSchedulingHash.current = schedulingHash;
      if (medications.length > 0) {
        doReschedule();
      }
    }

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        doReschedule();
      }
    });
    return () => subscription.remove();
  }, [medications]);

  useEffect(() => {
    const unsub = onForegroundNotificationEvent((actionId, response) => {
      const data = response.notification.request.content.data as
        | { medicationId?: string; scheduledTime?: string }
        | undefined;
      if (!data?.medicationId || !data?.scheduledTime) return;

      if (actionId === "taken" || actionId === "skip") {
        processNotificationAction(
          actionId,
          data.medicationId,
          data.scheduledTime,
        );
      }
    });
    return unsub;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={getNavigationTheme(isDarkMode)}>
            <StatusBar
              barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <RootStack.Navigator>
              <RootStack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="AddMedication"
                component={AddMedicationNavigator}
                options={{
                  presentation: "transparentModal",
                  headerShown: false,
                  animation: "fade",
                  title: "Add Medication",
                }}
              />
              <RootStack.Screen
                name="Settings"
                component={SettingsNavigator}
                options={{ headerShown: false, title: "Settings" }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
