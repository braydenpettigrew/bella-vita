import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { useCallback, useContext, useLayoutEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import { fetchHistory } from "../util/http";
import Title from "../components/Title";
import { useFocusEffect } from "@react-navigation/native";
import HistoryEntry from "../components/HistoryEntry";
import LoadingOverlay from "../components/LoadingOverlay";

function AllHistoryScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      headerRight: ({ tintColor }) => (
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: tintColor }}>Cancel</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          const history = await fetchHistory(authCtx.token);
          const historyArray = Object.values(history).reverse();
          setHistory(historyArray);
          setIsLoaded(true);
        } catch (error) {
          console.log("All History Screen Error: ", error);
        }
      }

      fetchData();
    }, [navigation])
  );

  return isLoaded ? (
    <ScrollView>
      <View style={styles.container}>
        <Title>All History</Title>
        {history.map((item, index) => (
          <HistoryEntry key={index} onDeleteHistory={handleDeleteHistory}>{item}</HistoryEntry>
        ))}
      </View>
    </ScrollView>
  ) : (
    <LoadingOverlay />
  );
}

export default AllHistoryScreen;

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
