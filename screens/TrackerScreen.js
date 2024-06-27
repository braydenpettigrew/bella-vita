import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";
import { fetchHistory, fetchPoints } from "../util/http";
import { useState, useCallback, useEffect } from "react";
import HistoryEntry from "../components/HistoryEntry";
import MyButton from "../components/MyButton";
import LoadingOverlay from "../components/LoadingOverlay";
import { FIREBASE_AUTH } from "../firebaseConfig";
import MyAlert from "../components/MyAlert";

function TrackerScreen({ navigation, route }) {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;
  const [message, setMessage] = useState("");

  useEffect(() => {
    const newMessage = route?.params?.message || false;
    setMessage(newMessage);
    if (newMessage) {
      handleShowAlert();
    }
  }, [navigation, route]);

  function addButtonPressedHandler() {
    navigation.navigate("AddPoints", { points });
  }

  function removeButtonPressedHandler() {
    navigation.navigate("RemovePoints", { points });
  }

  // Check if user is an admin
  useEffect(() => {
    setIsAdmin(false);
    if (
      user.email === "brayden@thepettigrews.org" ||
      user.email === "sarafezz41@yahoo.com" ||
      user.email === "mommsy1@yahoo.com" ||
      user.email === "fezzuoglio@yahoo.com"
    ) {
      setIsAdmin(true);
    }
  }, []);

  // Define a function to update history when deleted
  function handleDeleteHistory(timestamp) {
    // Filter out the deleted history item
    const updatedHistory = history.filter(
      (item) => item.timestamp !== timestamp
    );
    // Update the state
    setHistory(updatedHistory);
  }

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          const points = await fetchPoints(token);
          const history = await fetchHistory(token);
          const historyArray = Object.values(history).reverse();
          setPoints(points);
          setHistory(historyArray);
          setIsLoaded(true);
        } catch (error) {
          console.log("Tracker Screen Error: ", error);
        }
      }

      fetchData();
    }, [navigation, token])
  );

  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  return isLoaded ? (
    <ScrollView>
      <View style={styles.container}>
        <Title>Austin's Points</Title>
        {showAlert && (
          <MyAlert message={message} duration={5000} onHide={handleHideAlert} />
        )}
        <View
          style={[
            styles.pointsContainer,
            !isAdmin && { justifyContent: "center" },
          ]}
        >
          {isAdmin && (
            <IconButton
              icon="remove"
              size={48}
              color={Colors.primaryRed}
              onPress={removeButtonPressedHandler}
            />
          )}
          <Text style={styles.pointsText}>{points}</Text>
          {isAdmin && (
            <IconButton
              icon="add"
              size={48}
              color={Colors.primaryRed}
              onPress={addButtonPressedHandler}
            />
          )}
        </View>
        <Title>Recent History</Title>
        {history.slice(0, 10).map((item, index) => (
          <HistoryEntry key={index} onDeleteHistory={handleDeleteHistory}>
            {item}
          </HistoryEntry>
        ))}
        <MyButton
          style={styles.historyButton}
          mode="flat"
          onPress={() => navigation.navigate("AllHistory")}
        >
          View all history
        </MyButton>
      </View>
    </ScrollView>
  ) : (
    <LoadingOverlay />
  );
}

export default TrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  pointsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 48,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    height: 100,
    width: "75%",
  },
  pointsText: {
    fontSize: 48,
    color: "white",
  },
  historyButton: {
    padding: 12,
  },
});
