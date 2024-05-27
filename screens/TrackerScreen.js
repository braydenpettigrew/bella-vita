import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";
import IconButton from "../components/IconButton";
import Colors from "../constants/colors";

function TrackerScreen({ navigation }) {
  function addButtonPressedHandler() {
    navigation.navigate("AddPoints");
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Trackers</Title>
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
