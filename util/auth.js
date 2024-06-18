import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_KEY = "AIzaSyB73AZKXMGzg8oLSEoEMhXlcvkOjAjBtZQ";

async function authenticate(mode, email, password) {
  try {
    let response;
    if (mode === "signUp") {
      response = await createUserWithEmailAndPassword(auth, email, password);
    } else if (mode === "signInWithPassword") {
      response = await signInWithEmailAndPassword(auth, email, password);
    }

    const uemail = response.user.email;
    const idToken = await response.user.getIdToken();
    const refreshToken = response.user.refreshToken;

    return [idToken, refreshToken, uemail];
  } catch (error) {
    console.error("Authentication error:", error.message);
    throw error; // Propagate error for handling in UI or calling function
  }
}

export function createUser(email, password) {
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}

async function refreshTokens(r) {
  try {
    const refreshResponse = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
      {
        grant_type: "refresh_token",
        refresh_token: r,
      }
    );

    const token = refreshResponse.data.id_token;
    const refreshToken = refreshResponse.data.refresh_token;

    // Store the new token in local storage or session storage
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("refreshToken", refreshToken);
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

export async function initializeApp() {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (refreshToken) {
    await refreshTokens(refreshToken);
  }
}
