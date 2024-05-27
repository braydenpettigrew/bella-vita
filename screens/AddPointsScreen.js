import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/myButton";
import { updatePoints } from "../util/http";
import { useState } from "react";

function AddPointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);

  function addPressHandler() {
    updatePoints(parseInt(enteredPoints) + route.params.points);
    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Add Points</Title>
        <Input
          label="Enter Points:"
          invalid={false}
          style={styles.input}
          textInputConfig={{
            keyboardType: "numeric",
            onChangeText: setEnteredPoints,
            value: enteredPoints,
          }}
        />
        <MyButton onPress={addPressHandler} mode="flat">
          Add
        </MyButton>
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
  input: {
    width: "50%",
  },
});
