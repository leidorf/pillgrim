import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";
import MedsScreen from "./screens/MedsScreen";
import LogsScreen from "./screens/LogsScreen";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export type RootStackParamList = {
  Home: undefined;
  Meds: undefined;
  Logs: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
                <FontAwesome6
                  name="prescription-bottle"
                  size={24}
                  color={color}
                />
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
