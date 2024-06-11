import AuthContent from "../components/AuthContent";
import { useContext, useState } from "react";
import { login } from "../util/auth";
import { Alert, Text } from "react-native";
import { AuthContext } from "../context/auth-context";
import LoadingOverlay from "../components/LoadingOverlay";

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const tokens = await login(email, password);
      authCtx.authenticate(tokens[0], tokens[1]);
    } catch (error) {
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
