import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import Title from "../components/Title";

function HomeScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Bella Vita</Title>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("../assets/cross.png")}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              He said to all, “If anyone desires to come after me, let him deny
              himself, take up his cross, and follow me. (Luke 9:23)”
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  contentContainer: {
    flex: 0.75,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    margin: 16,
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 16,
  },
  textContainer: {
    margin: 16,
    padding: 16,
    width: "80%",
    borderBottomWidth: 2,
    borderBottomColor: "#e2c714",
  },
  text: {
    textAlign: "center",
    fontSize: 15,
  },
});
