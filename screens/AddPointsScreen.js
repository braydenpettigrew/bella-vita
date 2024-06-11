import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/MyButton";
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
        title: "Austin earned points :)",
        body: "Open the Bella Vita app to see how.",
      }),
    });
  }

  function addPressHandler() {
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
    updatePoints(parseInt(enteredPoints) + route.params.points, authCtx.token);
    storeHistory(
      {
        pointsAdded: enteredPoints,
        user: authCtx.name ? authCtx.name : enteredUser.trim(),
        reason: enteredReason.trim(),
        timestamp: Date.now(),
      },
      authCtx.token
    );

    // Send notifications to other users that points were added.
    sendPushNotificationHandler();

    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Title>Add Points</Title>
        </View>
        {!authCtx.name && (
          <Input
            label="Who is adding these points? (Set your name in settings to avoid this field!)"
            invalid={userInvalid}
            style={styles.input}
            textInputConfig={{
              onChangeText: setEnteredUser,
              value: enteredUser,
            }}
          />
        )}
        <Input
          label="How many points are you adding?"
          invalid={pointsInvalid}
          style={styles.input}
          textInputConfig={{
            keyboardType: "numeric",
            onChangeText: setEnteredPoints,
            value: enteredPoints,
          }}
        />
        <Input
          label="Why are you adding points?"
          invalid={reasonInvalid}
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
  input: {
    width: "80%",
    marginVertical: 8,
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
