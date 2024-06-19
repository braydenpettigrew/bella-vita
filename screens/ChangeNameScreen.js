import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Input from "../components/Input";
import Colors from "../constants/colors";
import MyButton from "../components/MyButton";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";

function ChangeNameScreen({ navigation }) {
  const [name, setName] = useState("");
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  function changeNamePressedHandler() {
    updateProfile(user, { displayName: name });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>
        This is the name that will be displayed across the app to you and other
        users{"\n"}(ex: in the history under Austin's Points)
      </Text>
      <View style={styles.inputContainer}>
        <Input
          label="New Name:"
          style={styles.input}
          textInputConfig={{
            onChangeText: setName,
            value: name,
          }}
        />
        <MyButton onPress={changeNamePressedHandler}>Change Name</MyButton>
      </View>
    </View>
  );
}

export default ChangeNameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
    color: Colors.primaryDarkGray,
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
