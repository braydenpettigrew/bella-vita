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

function AllHistoryScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
          console.log("Error: ", error);
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
          <HistoryEntry key={index}>{item}</HistoryEntry>
        ))}
      </View>
    </ScrollView>
  ) : (
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  );
}

export default AllHistoryScreen;

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
