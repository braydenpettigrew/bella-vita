import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  name: "",
  token: "",
  refreshToken: "",
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
  changeName: () => {},
});

function AuthContextProvider({ children }) {
  const [name, setName] = useState("");
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

  function changeName(name) {
    AsyncStorage.setItem("name", name);
    setName(name);
  }

  const value = {
    name: name,
    token: authToken,
    refreshToken: refreshToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
    changeName: changeName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
