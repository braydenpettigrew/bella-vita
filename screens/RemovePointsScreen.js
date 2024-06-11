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

  // Quick add only works if the user has set a name in settings.
  function quickRemovePressHandler(points, reason) {
    updatePoints(route.params.points - points, authCtx.token);
    storeHistory(
      {
        pointsRemoved: points,
        user: authCtx.name,
        reason: reason,
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
      <View style={styles.titleContainer}>
        <Title>Remove Points</Title>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>Custom Remove</Text>
      </View>
      <View style={styles.container}>
        {!authCtx.name && (
          <Input
            label="Who is removing these points? (Set your name in settings to avoid this field!)"
            invalid={userInvalid}
            style={styles.input}
            textInputConfig={{
              onChangeText: setEnteredUser,
              value: enteredUser,
            }}
          />
        )}
        <Input
          label="How many points are you removing?"
          invalid={pointsInvalid}
          style={styles.input}
          textInputConfig={{
            keyboardType: "numeric",
            onChangeText: setEnteredPoints,
            value: enteredPoints,
          }}
        />
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
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>Quick Remove</Text>
      </View>
      {authCtx.name ? (
        <>
          <View style={styles.quickRemoveContainer}>
            <Text style={styles.quickRemoveText}>Cursing (-1) </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickRemovePressHandler.bind(this, 1, "Cursing")}
            >
              Remove
            </MyButton>
          </View>
          <View style={styles.quickRemoveContainer}>
            <Text style={styles.quickRemoveText}>Being Rude (-1) </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickRemovePressHandler.bind(this, 1, "Being rude")}
            >
              Remove
            </MyButton>
          </View>
        </>
      ) : (
        <View style={styles.quickRemoveAccessContainer}>
          <Text style={styles.quickRemoveAccessText}>
            Set your name in settings to have access to quick remove!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

export default AddPointsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryBlue,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "80%",
    marginVertical: 8,
  },
  errorContainer: {
    width: "75%",
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
  },
  quickRemoveContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryGray,
    borderRadius: 8,
    margin: 2,
  },
  subtitleContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quickRemoveText: {
    fontSize: 18,
    fontWeight: "400",
  },
  quickRemoveAccessContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  quickRemoveAccessText: {
    fontSize: 16,
    textAlign: "center",
  },
});
