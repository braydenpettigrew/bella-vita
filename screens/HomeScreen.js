import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import Title from "../components/Title";
import Colors from "../constants/colors";

function HomeScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Bella Vita</Title>
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>This screen is still in progress...</Text>
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
  image: {
    height: 200,
    width: 200,
    borderRadius: 16,
  },
  textContainer: {
    margin: 16,
    padding: 16,
    width: "80%",
    borderWidth: 2,
    borderColor: Colors.primaryRed,
  },
  text: {
    textAlign: "center",
    fontSize: 15,
  },
});
