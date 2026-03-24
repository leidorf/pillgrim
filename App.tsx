import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";
import MedsScreen from "./screens/MedsScreen";
import LogsScreen from "./screens/LogsScreen";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AddMedicationParamList,
  MainScreenParamList,
  RootStackParamList,
  SettingsParamList,
} from "./types/navigation";
import Step1Screen from "./screens/AddMedication/Step1Screen";
import SettingsScreen from "./screens/Settings/SettingsScreen";

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
        tabBarActiveTintColor: "green",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Meds"
        component={MedsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="prescription-bottle" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="chart-simple" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AddMedicationNavigator = () => {
  return (
    <AddMedStack.Navigator>
      <AddMedStack.Screen name="Step1" component={Step1Screen} />
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
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="AddMedication"
            component={AddMedicationNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Settings"
            component={SettingsNavigator}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
