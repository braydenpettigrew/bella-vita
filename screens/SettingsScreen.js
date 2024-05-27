import { ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";

function SettingsScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Settings</Title>
        <Text>Currently there are no settings available.</Text>
      </View>
    </ScrollView>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
