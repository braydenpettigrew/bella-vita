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

function AddPointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);
  const [enteredUser, setEnteredUser] = useState("");
  const [enteredReason, setEnteredReason] = useState("");

  function addPressHandler() {
    updatePoints(parseInt(enteredPoints) + route.params.points);
    storeHistory({
      pointsAdded: enteredPoints,
      user: enteredUser,
      reason: enteredReason,
    });
    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Title>Add Points</Title>
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
          label="Who is adding these points?"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            onChangeText: setEnteredUser,
            value: enteredUser,
          }}
        />
        <Input
          label="Why are you adding points?"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            onChangeText: setEnteredReason,
            value: enteredReason,
            multiline: true,
          }}
        />
        <MyButton onPress={addPressHandler} mode="flat">
          Add
        </MyButton>
      </View>
    </ScrollView>
  );
}

export default AddPointsScreen;

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
