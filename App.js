import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Colors from "./constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AddPointsScreen from "./screens/AddPointsScreen";
import AllHistoryScreen from "./screens/AllHistoryScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RemovePointsScreen from "./screens/RemovePointsScreen";
import AuthContextProvider from "./context/auth-context";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import { useEffect } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { Alert, Pressable, Text } from "react-native";
import { initializeApp } from "./util/auth";
import * as Notifications from "expo-notifications";
import { pushTokenExists, storePushToken } from "./util/http";
import ChangeNameScreen from "./screens/ChangeNameScreen";
import LoadingOverlay from "./components/LoadingOverlay";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primaryBlue },
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
  authCtx = useContext(AuthContext);

  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required!",
          "Push notifications need the appropriate permissions"
        );
        return;
      }

      // Get the push token
      let pushToken;
      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "1665e483-bcfa-4038-8648-d69ae25d7e5d",
        });
        pushToken = pushTokenData.data;
      } catch (error) {
        Alert.alert("Error", `${error}`);
      }

      // Check if the push token has already been stored in the backend
      try {
        // res will be equal to true or false
        const res = await pushTokenExists(pushToken, authCtx.token);

        if (res) {
          return;
        }
      } catch (error) {
        console.error("Error checking push token on the backend: ", error);
        return;
      }

      // If the push token doesn't exist on the backend, proceed to store it
      try {
        await storePushToken({ pushToken: pushToken }, authCtx.token);
      } catch (error) {
        console.error("Error storing push token on Firebase backend: ", error);
      }
    }

    configurePushNotifications();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primaryBlue },
          headerTintColor: "white",
          tabBarStyle: { backgroundColor: Colors.primaryBlue },
          tabBarActiveTintColor: Colors.primaryRed,
        }}
      >
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
        {/* <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        /> */}
        <Tab.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{
            headerShown: false,
            title: "Settings",
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
        headerStyle: { backgroundColor: Colors.primaryBlue },
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
        options={{
          presentation: "fullScreenModal",
          title: "Add",
        }}
      />
      <Stack.Screen
        name="RemovePoints"
        component={RemovePointsScreen}
        options={{
          presentation: "fullScreenModal",
          title: "Remove",
        }}
      />
      <Stack.Screen
        name="AllHistory"
        component={AllHistoryScreen}
        options={{
          presentation: "fullScreenModal",
          title: "History",
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  function logout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // User confirmed deletion, delete the tracker
            authCtx.logout();
          },
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primaryBlue },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerRight: ({ tintColor }) => (
            <Pressable onPress={logout}>
              <Text style={{ color: tintColor, marginRight: 16 }}>Log out</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="ChangeName"
        component={ChangeNameScreen}
        options={{ title: "Name" }}
      />
    </Stack.Navigator>
  );
}

function Navigation({ isAuthenticated }) {
  return (
    <NavigationContainer>
      {!isAuthenticated && <AuthStack />}
      {isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    async function fetchToken() {
      let storedToken = await AsyncStorage.getItem("token");
      let storedRefreshToken = await AsyncStorage.getItem("refreshToken");

      if (storedToken) {
        await initializeApp();
        storedToken = await AsyncStorage.getItem("token");
        storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        authCtx.authenticate(storedToken, storedRefreshToken);
      }
    }

    fetchToken();
  }, []);

  // Get the name and email of the user
  useEffect(() => {
    async function getNameAndEmail() {
      let userName = await AsyncStorage.getItem("name");
      let userEmail = await AsyncStorage.getItem("email");

      if (userName) {
        authCtx.changeName(userName);
        authCtx.setUserEmail(userEmail);
      }
    }

    getNameAndEmail();
  }, []);

  return authCtx.isAuthenticated === null ? (
    <LoadingOverlay />
  ) : (
    <Navigation isAuthenticated={authCtx.isAuthenticated} />
  );
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
