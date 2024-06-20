import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Input from "../components/Input";
import Colors from "../constants/colors";
import MyButton from "../components/MyButton";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import Title from "../components/Title";

function NewUserScreen({ onChangeName }) {
  const [name, setName] = useState("");
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  function changeNamePressedHandler() {
    if (name.trim() !== "") onChangeName(name);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Title>Bella Vita</Title>
      <View style={styles.textContainer}>
        <Text style={styles.infoText}>
          Hello, and welcome! Please enter your name below. This name will be
          your display name on the app. You will be able to change this name in
          the app settings.
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <Input
          label="Enter Name:"
          style={styles.input}
          textInputConfig={{
            onChangeText: setName,
            value: name,
            placeholder: "Name...",
          }}
        />
        <MyButton
          onPress={changeNamePressedHandler}
          style={{ alignItems: "center" }}
        >
          Continue to Bella Vita
        </MyButton>
      </View>
    </SafeAreaView>
  );
}

export default NewUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    alignItems: "center",
  },
  textContainer: {
    margin: 16,
  },
  infoText: {
    textAlign: "center",
    color: Colors.primaryBlue,
  },
  inputContainer: {
    marginVertical: 32,
  },
  input: {
    marginVertical: 16,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
