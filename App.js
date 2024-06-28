import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Colors from "./constants/colors";

import SettingsScreen from "./screens/SettingsScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AddPointsScreen from "./screens/AddPointsScreen";
import AllHistoryScreen from "./screens/AllHistoryScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RemovePointsScreen from "./screens/RemovePointsScreen";
import { useEffect, useState, useRef } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { Alert, Pressable, Text } from "react-native";
import * as Notifications from "expo-notifications";
import {
  pushTokenExists,
  storePushToken,
  storePushTokenWithEmail,
} from "./util/http";
import ChangeNameScreen from "./screens/ChangeNameScreen";
import LoadingOverlay from "./components/LoadingOverlay";
import SocialScreen from "./screens/SocialScreen";
import MakePostScreen from "./screens/MakePostScreen";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseConfig";
import * as Updates from "expo-updates";
import NewUserScreen from "./screens/NewUserScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ProfileScreen from "./screens/ProfileScreen";
import PostScreen from "./screens/PostScreen";
import SocialGroupsScreen from "./screens/SocialGroupsScreen";

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
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Bella Vita" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: "Bella Vita" }}
      />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;
  const navigation = useNavigation();

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
          storePushTokenWithEmail(pushToken, user.email, token);
          return;
        }
      } catch (error) {
        console.error("Error checking push token on the backend: ", error);
        return;
      }

      // If the push token doesn't exist on the backend, proceed to store it
      try {
        storePushTokenWithEmail(pushToken, user.email, token);
      } catch (error) {
        console.error("Error storing push token on Firebase backend: ", error);
      }
    }

    configurePushNotifications();
  }, []);

  // Determine if the users display name is set, and set the initial route
  const [newUser, setNewUser] = useState(false);

  useEffect(() => {
    if (
      user.displayName === null ||
      user.displayName === undefined ||
      user.displayName === ""
    ) {
      setNewUser(true);
    }
  }, []);

  function setDisplayName(name) {
    updateProfile(user, { displayName: name });
    setNewUser(false);
  }

  // Handle when user presses social notifications
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Optionally handle received notification here if needed
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const screen = response.notification.request.content.data.screen;

        if (screen === "Social") {
          navigation.navigate("SocialStack");
        } else if (screen === "Post") {
          const item = response.notification.request.content.data.item;
          const navBack = true;
          navigation.navigate("SocialStack", {
            screen: "PostScreen",
            params: { item, navBack }, // Navigate to PostScreen with item as params
          });
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return newUser ? (
    <NewUserScreen onChangeName={setDisplayName} />
  ) : (
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
              <Ionicons name="add" color={color} size={size} />
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
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primaryBlue },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="Groups"
        component={SocialGroupsScreen}
        options={{
          title: "Groups",
        }}
      />
      <Stack.Screen
        name="Social"
        component={SocialScreen}
        options={{
          title: "Social",
          headerRight: ({ tintColor }) => (
            // navigation.navigate("Profile")
            <Pressable onPress={() => Alert.alert("Currently disabled.")}>
              <Ionicons
                name="person-circle-outline"
                color={tintColor}
                size={32}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="MakePost"
        component={MakePostScreen}
        options={{ title: "Create Post" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        options={{ title: "Post" }}
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

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }
  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        {isLoading && <LoadingOverlay />}
        {user === null && <AuthStack />}
        {user && <AuthenticatedStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
