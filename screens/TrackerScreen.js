import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";
import { fetchPoints, storePoints } from "../util/http";
import { useEffect, useState, useCallback } from "react";

function TrackerScreen({ navigation }) {
  const [points, setPoints] = useState(0);

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
          const points = await fetchPoints();
          setPoints(points);
        } catch (error) {
          console.log("Error: ", error);
        }
      }

      fetchData();
    }, [navigation])
  );

  return (
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
      </View>
    </ScrollView>
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
    marginVertical: 100,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 3,
    height: 100,
    width: "75%",
  },
  pointsText: {
    fontSize: 48,
    color: "white",
  },
});
