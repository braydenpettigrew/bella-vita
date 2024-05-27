import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: "",
  refreshToken: "",
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const refresh = await AsyncStorage.getItem("refreshToken");
        if (token) {
          setAuthToken(token);
          setRefreshToken(refresh);
        }
      } catch (error) {
        console.error(
          "Error loading authentication data from AsyncStorage:",
          error
        );
      }
    };

    loadAuthData();
  }, []);

  function authenticate(token, refresh) {
    setAuthToken(token);
    setRefreshToken(refresh);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("refreshToken", refresh);
  }

  function logout() {
    setAuthToken("");
    setRefreshToken("");
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("refreshToken");
  }

  const value = {
    token: authToken,
    refreshToken: refreshToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
