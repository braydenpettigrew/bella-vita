import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/myButton";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllPushTokens, storeHistory, updatePoints } from "../util/http";
import { useLayoutEffect, useState } from "react";
import Colors from "../constants/colors";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

function AddPointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);
  const [enteredUser, setEnteredUser] = useState("");
  const [enteredReason, setEnteredReason] = useState("");
  const [pointsInvalid, setPointsInvalid] = useState(false);
  const [userInvalid, setUserInvalid] = useState(false);
  const [reasonInvalid, setReasonInvalid] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const authCtx = useContext(AuthContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: tintColor }}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  async function sendPushNotificationHandler() {
    const pushTokensArray = await getAllPushTokens(authCtx.token);

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushTokensArray,
        title: "Austin lost points :(",
        body: "Open the Bella Vita app to see how.",
      }),
    });
  }

  function removePressHandler() {
    setPointsInvalid(false);
    setUserInvalid(false);
    setReasonInvalid(false);

    if (
      parseInt(enteredPoints) === 0 ||
      (!authCtx.name && enteredUser === "") ||
      enteredReason === ""
    ) {
      if (parseInt(enteredPoints) === 0) {
        setPointsInvalid(true);
      }
      if (!authCtx.name && enteredUser === "") {
        setUserInvalid(true);
      }
      if (enteredReason === "") {
        setReasonInvalid(true);
      }

      setErrorVisible(true);
      return;
    }
    updatePoints(route.params.points - parseInt(enteredPoints), authCtx.token);
    storeHistory(
      {
        pointsRemoved: enteredPoints,
        user: authCtx.name ? authCtx.name : enteredUser.trim(),
        reason: enteredReason.trim(),
        timestamp: Date.now(),
      },
      authCtx.token
    );

    // Send notifications to other users that points were removed.
    sendPushNotificationHandler();

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
              color={Colors.primaryRed}
            />
          </TouchableOpacity>
        </View>
        <Input
          label="How many points do you want to remove?"
          invalid={pointsInvalid}
          style={styles.input}
          textInputConfig={{
            keyboardType: "numeric",
            onChangeText: setEnteredPoints,
            value: enteredPoints,
          }}
        />
        {!authCtx.name && (
          <Input
            label="Who is removing these points?"
            invalid={userInvalid}
            style={styles.input}
            textInputConfig={{
              onChangeText: setEnteredUser,
              value: enteredUser,
            }}
          />
        )}
        <Input
          label="Why are you removing points?"
          invalid={reasonInvalid}
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
        <View style={styles.errorContainer}>
          {errorVisible && (
            <Text style={styles.errorText}>
              Please fill out all fields. Point value cannot be zero.
            </Text>
          )}
        </View>
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
  errorContainer: {
    width: "75%",
    marginTop: 24,
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
  },
});
