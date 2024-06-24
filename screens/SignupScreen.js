import { Alert, StyleSheet, View } from "react-native";
import AuthContent from "../components/AuthContent";
import { createUser } from "../util/auth";
import { useState } from "react";
import LoadingOverlay from "../components/LoadingOverlay";
import Title from "../components/Title";

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

  return (
    <>
      <View style={styles.container}>
        <Title>Sign Up</Title>
      </View>
      <AuthContent onAuthenticate={signupHandler} />
    </>
  );
}

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
