import { ScrollView, StyleSheet, View } from "react-native";
import { useLayoutEffect } from "react";
import Title from "../components/Title";
import IconButton from "../components/IconButton";

function TrackerScreen({ navigation }) {
  function addButtonPressedHandler() {
    navigation.navigate("AddTracker");
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <IconButton
          icon="add"
          size={24}
          color={tintColor}
          onPress={addButtonPressedHandler}
        />
      ),
    });
  }, [navigation, addButtonPressedHandler]);
  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Trackers</Title>
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
