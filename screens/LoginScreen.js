import AuthContent from "../components/AuthContent";
import { useState } from "react";
import { login } from "../util/auth";
import { Alert } from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import { FIREBASE_AUTH } from "../firebaseConfig";

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const tokens = await login(email, password);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Authentication failed!",
        "Could not log you in. Please check your credentials or try again later!"
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay />;
  }
  return <AuthContent isLogin={true} onAuthenticate={loginHandler} />;
}

export default LoginScreen;
