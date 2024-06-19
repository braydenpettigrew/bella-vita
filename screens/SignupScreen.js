import { Alert } from "react-native";
import AuthContent from "../components/AuthContent";
import { createUser } from "../util/auth";
import { useState } from "react";
import LoadingOverlay from "../components/LoadingOverlay";

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const tokens = await createUser(email, password);
    } catch (error) {
      Alert.alert(
        "Authentication failed",
        "Could not create user, please check your input and try again later."
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
