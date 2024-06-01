import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";
import { fetchHistory, fetchPoints } from "../util/http";
import { useState, useCallback } from "react";
import HistoryEntry from "../components/HistoryEntry";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/myButton";

function TrackerScreen({ navigation }) {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const authCtx = useContext(AuthContext);

  function addButtonPressedHandler() {
    navigation.navigate("AddPoints", { points });
  }

  function removeButtonPressedHandler() {
    navigation.navigate("RemovePoints", { points });
  }

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          const points = await fetchPoints(authCtx.token);
          const history = await fetchHistory(authCtx.token);
          const historyArray = Object.values(history).reverse();
          setPoints(points);
          setHistory(historyArray);
          setIsLoaded(true);
        } catch (error) {
          console.log("Error: ", error);
        }
      }

      fetchData();
    }, [navigation])
  );

  return isLoaded ? (
    <ScrollView>
      <View style={styles.container}>
        <Title>Austin's Points</Title>
        <View style={styles.pointsContainer}>
          <IconButton
            icon="remove"
            size={48}
            color={Colors.primaryYellow}
            onPress={removeButtonPressedHandler}
          />
          <Text style={styles.pointsText}>{points}</Text>
          <IconButton
            icon="add"
            size={48}
            color={Colors.primaryYellow}
            onPress={addButtonPressedHandler}
          />
        </View>
        <Title>Recent History</Title>
        {history.slice(0, 10).map((item, index) => (
          <HistoryEntry key={index}>{item}</HistoryEntry>
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
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  );
}

export default TrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  loadingContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
