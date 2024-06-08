import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_KEY = "AIzaSyB73AZKXMGzg8oLSEoEMhXlcvkOjAjBtZQ";

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;
  const response = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true,
  });

  const token = response.data.idToken;
  const refreshToken = response.data.refreshToken;
  return [token, refreshToken];
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
