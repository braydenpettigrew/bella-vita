import { View, Text, StyleSheet } from "react-native";
import Title from "../components/Title";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Title>Bella Vita</Title>
      <View>
        <Text>
          He said to all, “If anyone desires to come after me, let him deny
          himself, take up his cross, and follow me. (Luke 9:23)”
        </Text>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
