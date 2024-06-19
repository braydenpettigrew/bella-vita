import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Colors from "./constants/colors";

import SettingsScreen from "./screens/SettingsScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AddPointsScreen from "./screens/AddPointsScreen";
import AllHistoryScreen from "./screens/AllHistoryScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RemovePointsScreen from "./screens/RemovePointsScreen";
import { useEffect, useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { Alert, Pressable, Text } from "react-native";
import * as Notifications from "expo-notifications";
import { pushTokenExists, storePushToken } from "./util/http";
import ChangeNameScreen from "./screens/ChangeNameScreen";
import LoadingOverlay from "./components/LoadingOverlay";
import SocialScreen from "./screens/SocialScreen";
import MakePostScreen from "./screens/MakePostScreen";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseConfig";

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
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;

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
        const res = await pushTokenExists(pushToken, token);

        if (res) {
          return;
        }
      } catch (error) {
        console.error("Error checking push token on the backend: ", error);
        return;
      }

      // If the push token doesn't exist on the backend, proceed to store it
      try {
        await storePushToken({ pushToken: pushToken }, token);
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
        <Tab.Screen
          name="SocialStack"
          component={SocialStack}
          options={{
            headerShown: false,
            title: "Social",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera-outline" color={color} size={size} />
            ),
          }}
        />
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

function SocialStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primaryBlue },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="Social"
        component={SocialScreen}
        options={{
          title: "Social",
        }}
      />
      <Stack.Screen
        name="MakePost"
        component={MakePostScreen}
        options={{ title: "Create Post" }}
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
            FIREBASE_AUTH.signOut();
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        {isLoading && <LoadingOverlay />}
        {user === null && <AuthStack />}
        {user && <AuthenticatedStack />}
      </NavigationContainer>
    </>
  );
}
