import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";

function AddTrackerScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Tracker</Title>
      </View>
    </ScrollView>
  );
}

export default AddTrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
