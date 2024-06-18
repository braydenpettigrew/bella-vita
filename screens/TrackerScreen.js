import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";
import { fetchHistory, fetchPoints } from "../util/http";
import { useState, useCallback, useLayoutEffect, useEffect } from "react";
import HistoryEntry from "../components/HistoryEntry";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/MyButton";
import { initializeApp } from "../util/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "../components/LoadingOverlay";

function TrackerScreen({ navigation }) {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const authCtx = useContext(AuthContext);

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
      authCtx.email === "brayden@thepettigrews.org" ||
      authCtx.email === "sarafezz41@yahoo.com" ||
      authCtx.email === "mommsy1@yahoo.com" ||
      authCtx.email === "fezzuoglio@yahoo.com"
    ) {
      setIsAdmin(true);
    }
  }, [authCtx]);

  // Function to refresh token when user clicks refresh button
  async function fetchToken() {
    let storedToken = await AsyncStorage.getItem("token");
    let storedRefreshToken = await AsyncStorage.getItem("refreshToken");

    if (storedToken) {
      setIsLoaded(false);
      await initializeApp();
      storedToken = await AsyncStorage.getItem("token");
      storedRefreshToken = await AsyncStorage.getItem("refreshToken");
      authCtx.authenticate(storedToken, storedRefreshToken);
      setIsLoaded(true);
    }
  }

  // Define a function to update history when deleted
  function handleDeleteHistory(timestamp) {
    // Filter out the deleted history item
    const updatedHistory = history.filter(
      (item) => item.timestamp !== timestamp
    );
    // Update the state
    setHistory(updatedHistory);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({ tintColor }) => (
        <View
          style={{
            position: "absolute",
            left: -12,
          }}
        >
          <IconButton
            icon="refresh"
            size={24}
            color={tintColor}
            onPress={fetchToken}
          />
        </View>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        await fetchToken();
        try {
          const points = await fetchPoints(authCtx.token);
          const history = await fetchHistory(authCtx.token);
          const historyArray = Object.values(history).reverse();
          setPoints(points);
          setHistory(historyArray);
          setIsLoaded(true);
        } catch (error) {
          console.log("Tracker Screen Error: ", error);
        }
      }

      fetchData();
    }, [navigation, authCtx.token])
  );

  return isLoaded ? (
    <ScrollView>
      <View style={styles.container}>
        <Title>Austin's Points</Title>
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
