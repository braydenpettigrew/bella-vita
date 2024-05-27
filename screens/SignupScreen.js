import { Alert, Text } from "react-native";
import AuthContent from "../components/AuthContent";
import { createUser } from "../util/auth";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth-context";

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const tokens = await createUser(email, password);
      authCtx.authenticate(tokens[0], tokens[1]);
    } catch (error) {
      Alert.alert(
        "Authentication failed",
        "Could not create user, please check your input and try again later."
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <Text>Loading</Text>;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
