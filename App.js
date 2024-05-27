import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Colors from "./constants/colors";

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AddPointsScreen from "./screens/AddPointsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RemovePointsScreen from "./screens/RemovePointsScreen";
import AuthContextProvider from "./context/auth-context";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import { useEffect } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primaryBlue },
          headerTintColor: "white",
          tabBarStyle: { backgroundColor: Colors.primaryBlue },
          tabBarActiveTintColor: Colors.primaryYellow,
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
            title: "Points",
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
    </>
  );
}

function TrackerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#77b7e2" },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="Tracker"
        component={TrackerScreen}
        options={{ title: "Points" }}
      />
      <Stack.Screen
        name="AddPoints"
        component={AddPointsScreen}
        options={{ presentation: "modal", title: "Add" }}
      />
      <Stack.Screen
        name="RemovePoints"
        component={RemovePointsScreen}
        options={{ presentation: "modal", title: "Remove" }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);
  return (
    <NavigationContainer>
      {!authCtx.isAuthenticated && <AuthStack />}
      {authCtx.isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (storedToken) {
        authCtx.authenticate(storedToken, storedUserId);
      }
    }

    fetchToken();
  }, []);

  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
