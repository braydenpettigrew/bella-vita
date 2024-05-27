import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";

function SettingsScreen() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Settings</Title>
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
