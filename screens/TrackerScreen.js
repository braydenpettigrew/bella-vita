import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";
import { fetchPoints } from "../util/http";
import { useEffect, useState } from "react";

function TrackerScreen({ navigation }) {
  const [points, setPoints] = useState(0);

  function addButtonPressedHandler() {
    navigation.navigate("AddPoints");
  }

  useEffect(() => {
    async function fetch() {
      try {
        const points = await fetchPoints();
        setPoints(points);
      } catch (error) {
        console.log(error);
      }
    }

    fetch();
  }, []);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Austin's Points</Title>
        <IconButton
          icon="add"
          size={24}
          color={Colors.primaryBlue}
          onPress={addButtonPressedHandler}
        />
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
});
