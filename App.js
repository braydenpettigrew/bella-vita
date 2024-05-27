import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AddTrackerScreen from "./screens/AddTrackerScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TrackerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#77b7e2" },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen name="Tracker" component={TrackerScreen} />
      <Stack.Screen
        name="AddTracker"
        component={AddTrackerScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#77b7e2" },
            headerTintColor: "white",
            tabBarStyle: { backgroundColor: "#77b7e2" },
            tabBarActiveTintColor: "#e2c714",
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="TrackerStack"
            component={TrackerStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
