import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  name: "",
  email: "",
  token: "",
  refreshToken: "",
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
  changeName: () => {},
  setUserEmail: () => {},
});

function AuthContextProvider({ children }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const refresh = await AsyncStorage.getItem("refreshToken");
        if (token) {
          setAuthToken(token);
          setRefreshToken(refresh);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
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
    setIsAuthenticated(true);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("refreshToken", refresh);
  }

  function logout() {
    setAuthToken("");
    setRefreshToken("");
    setIsAuthenticated(false);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("refreshToken");
  }

  function changeName(name) {
    AsyncStorage.setItem("name", name);
    setName(name);
  }

  function setUserEmail(email) {
    AsyncStorage.setItem("email", email);
    setEmail(email);
  }

  const value = {
    name: name,
    email: email,
    token: authToken,
    refreshToken: refreshToken,
    isAuthenticated: isAuthenticated,
    authenticate: authenticate,
    logout: logout,
    changeName: changeName,
    setUserEmail: setUserEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
