import { useEffect, useRef, useState } from "react";
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

import HomeScreen from "./screens/HomeScreen";
import MedsScreen from "./screens/MedsScreen";
import Step1Screen from "./screens/AddMedication/Step1Screen/Step1Screen";
import SettingsScreen from "./screens/Settings";

import { getNavigationTheme } from "./theme/theme";
import { useAppTheme } from "./theme/useAppTheme";
import { useSettingsStore } from "./store/settingsStore";
import notifee, { EventType } from "@notifee/react-native";
import { useMedicationStore } from "./store/medicationStore";
import { useLogStore } from "./store/logsStore";
import { rescheduleAllNotifications, onForegroundNotificationEvent } from "./services/notificationService";
import { getLocalDateString } from "./utils/dateUtils";
import FullscreenAlarm, { AlarmData } from "./components/FullscreenAlarm";

/* ---------------------- Notification Action Handlers ---------------------- */
function createOrUpdateLog(
  medicationId: string,
  scheduledDate: string,
  scheduledTime: string,
  updates: { takenAt?: Date; skipped?: boolean; doseAmount?: number },
) {
  const { logs, addLog, updateLog } = useLogStore.getState();
  const existing = logs.find(
    (l) =>
      l.medicationId === medicationId &&
      l.scheduledDate === scheduledDate &&
      l.scheduledTime === scheduledTime,
  );
  if (existing) {
    updateLog(existing.id, updates);
  } else {
    addLog({ medicationId, scheduledDate, scheduledTime, ...updates });
  }
}

function handleNotificationTaken(
  medicationId: string,
  scheduledTime: string,
  dateStr: string,
) {
  const med = useMedicationStore
    .getState()
    .medications.find((m) => m.id === medicationId);
  const doseStr = med?.timeDoses?.find((td) => td.time === scheduledTime)?.dose;
  const doseAmount = doseStr ? parseInt(doseStr, 10) || undefined : undefined;

  createOrUpdateLog(medicationId, dateStr, scheduledTime, {
    takenAt: new Date(),
    skipped: false,
    doseAmount,
  });

  // Decrement stock
  if (doseAmount && doseAmount > 0) {
    useMedicationStore.getState().updateStock(medicationId, -doseAmount);
  }
}

function handleNotificationSkip(
  medicationId: string,
  scheduledTime: string,
  dateStr: string,
) {
  createOrUpdateLog(medicationId, dateStr, scheduledTime, {
    skipped: true,
  });
}

import PillIcon from "./assets/icons/pill.svg";
import HouseIcon from "./assets/icons/house.svg";
import CalendarIcon from "./assets/icons/calendar.svg";
import Step2Screen from "./screens/AddMedication/Step2Screen/Step2Screen";
import Step3Screen from "./screens/AddMedication/Step3Screen/Step3Screen";
import Step4Screen from "./screens/AddMedication/Step4Screen/Step4Screen";
import NotificationsScreen from "./screens/Settings/NotificationsScreen";
import AppearanceScreen from "./screens/Settings/AppearanceScreen";
import LanguageScreen from "./screens/Settings/LanguageScreen";
import AlarmScreen from "./screens/Settings/AlarmScreen";
import CalendarScreen from "./screens/CalendarScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainScreenParamList>();
const AddMedStack = createNativeStackNavigator<AddMedicationParamList>();
const SettingsStack = createNativeStackNavigator<SettingsParamList>();

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

const SettingsNavigator = () => {
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
};

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
  const hasRescheduled = useRef(false);
  const isRescheduling = useRef(false);
  const pendingReschedule = useRef(false);

  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);

  useEffect(() => {
    notifee.getInitialNotification().then((initial: any) => {
      if (!initial) return;
      const data = initial.notification.data as
        | { medicationId?: string; scheduledTime?: string }
        | undefined;
      if (!data?.medicationId || !data?.scheduledTime) return;

      const dateStr = getLocalDateString(new Date());
      if (initial.pressAction?.id === "taken") {
        handleNotificationTaken(data.medicationId, data.scheduledTime, dateStr);
      } else if (initial.pressAction?.id === "skip") {
        handleNotificationSkip(data.medicationId, data.scheduledTime, dateStr);
      }
    });
  }, []);

  useEffect(() => {
    const doReschedule = async () => {
      if (isRescheduling.current) {
        pendingReschedule.current = true;
        return;
      }
      if (medications.length === 0) return;

      isRescheduling.current = true;
      pendingReschedule.current = false;
      try {
        await rescheduleAllNotifications(
          medications,
          (id) => medications.find((m) => m.id === id)?.notificationIds ?? [],
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

    if (!hasRescheduled.current) {
      hasRescheduled.current = true;
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
    const unsub = onForegroundNotificationEvent((type, detail) => {
      const data = detail.notification?.data as
        | { medicationId?: string; scheduledTime?: string }
        | undefined;

      if (!data?.medicationId || !data?.scheduledTime) return;

      if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
        const dateStr = getLocalDateString(new Date());
        if (detail.pressAction.id === "taken") {
          handleNotificationTaken(data.medicationId, data.scheduledTime, dateStr);
        } else if (detail.pressAction.id === "skip") {
          handleNotificationSkip(data.medicationId, data.scheduledTime, dateStr);
        }
      }

      if (type === EventType.DELIVERED) {
        const fullscreen = useSettingsStore.getState().fullscreenNotification;
        if (fullscreen) {
          setAlarmData({
            medicationId: data.medicationId as string,
            scheduledTime: data.scheduledTime as string,
            title: detail.notification?.title ?? "",
            body: detail.notification?.body ?? "",
          });
        }
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

          {alarmData && (
            <FullscreenAlarm
              data={alarmData}
              onDismiss={() => setAlarmData(null)}
            />
          )}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
