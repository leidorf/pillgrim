import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AddMedicationParamList,
  MainScreenParamList,
  RootStackParamList,
  SettingsParamList,
} from "./types/navigation";

import HomeScreen from "./screens/HomeScreen";
import MedsScreen from "./screens/MedsScreen";
import LogsScreen from "./screens/LogsScreen";
import Step1Screen from "./screens/AddMedication/Step1Screen";
import SettingsScreen from "./screens/Settings/SettingsScreen";

import { AppTheme } from "./theme/theme";

import PillIcon from "./assets/icons/pill.svg";
import HouseIcon from "./assets/icons/house.svg";
import LogsIcon from "./assets/icons/logs.svg";
import Step2Screen from "./screens/AddMedication/Step2Screen";
import Step3Screen from "./screens/AddMedication/Step3Screen";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainScreenParamList>();
const AddMedStack = createNativeStackNavigator<AddMedicationParamList>();
const SettingsStack = createNativeStackNavigator<SettingsParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#689F38",
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
        name="Logs"
        component={LogsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <LogsIcon height={24} width={24} stroke={color} />
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
      {/* ------------------- other add med screen will be added ------------------  */}
    </AddMedStack.Navigator>
  );
};

const SettingsNavigator = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      {/* ------------------- other settings screen will be added ------------------  */}
    </SettingsStack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={AppTheme}>
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
    </SafeAreaProvider>
  );
}
