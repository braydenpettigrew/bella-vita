import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/MyButton";
import { getAllPushTokens, storeHistory, updatePoints } from "../util/http";
import { useLayoutEffect, useState } from "react";
import Colors from "../constants/colors";
import { FIREBASE_AUTH } from "../firebaseConfig";

function AddPointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);
  const [enteredUser, setEnteredUser] = useState("");
  const [enteredReason, setEnteredReason] = useState("");
  const [pointsInvalid, setPointsInvalid] = useState(false);
  const [userInvalid, setUserInvalid] = useState(false);
  const [reasonInvalid, setReasonInvalid] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;

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
    const pushTokensArray = await getAllPushTokens(token);

    let allPushTokens = [];
    for (item in pushTokensArray) {
      allPushTokens.push(pushTokensArray[item].pushToken);
    }

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: allPushTokens,
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
      (!user.displayName && enteredUser === "") ||
      enteredReason === ""
    ) {
      if (parseInt(enteredPoints) === 0) {
        setPointsInvalid(true);
      }
      if (!user.displayName && enteredUser === "") {
        setUserInvalid(true);
      }
      if (enteredReason === "") {
        setReasonInvalid(true);
      }

      setErrorVisible(true);
      return;
    }
    updatePoints(parseInt(enteredPoints) + route.params.points, token);
    storeHistory(
      {
        pointsAdded: enteredPoints,
        user: user.displayName ? user.displayName : enteredUser.trim(),
        reason: enteredReason.trim(),
        timestamp: Date.now(),
      },
      token
    );

    // Send notifications to other users that points were added.
    sendPushNotificationHandler();

    navigation.goBack();
  }

  // Quick add only works if the user has set a name in settings.
  function quickAddPressHandler(points, reason) {
    updatePoints(points + route.params.points, token);
    storeHistory(
      {
        pointsAdded: points,
        user: user.displayName,
        reason: reason,
        timestamp: Date.now(),
      },
      token
    );

    // Send notifications to other users that points were added.
    sendPushNotificationHandler();

    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.titleContainer}>
        <Title>Add Points</Title>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>Custom Add</Text>
      </View>
      <View style={styles.container}>
        {!user.displayName && (
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
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>Quick Add</Text>
      </View>
      {user.displayName ? (
        <>
          <View style={styles.quickAddContainer}>
            <Text style={styles.quickAddText}>
              Random Act of Kindness (+2):{" "}
            </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickAddPressHandler.bind(
                this,
                2,
                "Random Act of Kindness"
              )}
            >
              Add
            </MyButton>
          </View>
          <View style={styles.quickAddContainer}>
            <Text style={styles.quickAddText}>Good Manners (+1): </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickAddPressHandler.bind(this, 1, "Good manners")}
            >
              Add
            </MyButton>
          </View>
          <View style={styles.quickAddContainer}>
            <Text style={styles.quickAddText}>Brushing Teeth (+0.5): </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickAddPressHandler.bind(this, 0.5, "Brushing teeth")}
            >
              Add
            </MyButton>
          </View>
          <View style={styles.quickAddContainer}>
            <Text style={styles.quickAddText}>Showering (+0.5): </Text>
            <MyButton
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
              onPress={quickAddPressHandler.bind(this, 0.5, "Showering")}
            >
              Add
            </MyButton>
          </View>
        </>
      ) : (
        <View style={styles.quickAddAccessContainer}>
          <Text style={styles.quickAddAccessText}>
            Set your name in settings to have access to quick add!
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
  quickAddContainer: {
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
  quickAddText: {
    fontSize: 18,
    fontWeight: "400",
  },
  quickAddAccessContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
  },
  quickAddAccessText: {
    fontSize: 16,
    textAlign: "center",
  },
});
