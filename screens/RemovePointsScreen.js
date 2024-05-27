import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/myButton";
import { MaterialIcons } from "@expo/vector-icons";
import { storeHistory, updatePoints } from "../util/http";
import { useState } from "react";
import Colors from "../constants/colors";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

function RemovePointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);
  const [enteredUser, setEnteredUser] = useState("");
  const [enteredReason, setEnteredReason] = useState("");
  const authCtx = useContext(AuthContext);

  function removePressHandler() {
    updatePoints(route.params.points - parseInt(enteredPoints), authCtx.token);
    console.log("here");
    storeHistory(
      {
        pointsRemoved: enteredPoints,
        user: enteredUser,
        reason: enteredReason,
      },
      authCtx.token
    );
    console.log("hereee");
    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Title>Remove Points</Title>
          <TouchableOpacity style={styles.dismiss} onPress={Keyboard.dismiss}>
            <MaterialIcons
              name="keyboard-hide"
              size={40}
              color={Colors.primaryYellow}
            />
          </TouchableOpacity>
        </View>
        <Input
          label="Enter Points:"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            keyboardType: "numeric",
            onChangeText: setEnteredPoints,
            value: enteredPoints,
          }}
        />
        <Input
          label="Who is removing these points?"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            onChangeText: setEnteredUser,
            value: enteredUser,
          }}
        />
        <Input
          label="Why are you removing points?"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            onChangeText: setEnteredReason,
            value: enteredReason,
            multiline: true,
          }}
        />
        <MyButton onPress={removePressHandler} mode="flat">
          Remove
        </MyButton>
      </View>
    </ScrollView>
  );
}

export default RemovePointsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
  },
  dismiss: {
    marginTop: 20,
  },
  input: {
    width: "80%",
    marginVertical: 16,
  },
});
