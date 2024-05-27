import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";

function AddPointsScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Tracker</Title>
      </View>
    </ScrollView>
  );
}

export default AddPointsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
