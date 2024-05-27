import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";
import Input from "../components/Input";
import MyButton from "../components/myButton";
import { updatePoints } from "../util/http";
import { useState } from "react";

function RemovePointsScreen({ navigation, route }) {
  const [enteredPoints, setEnteredPoints] = useState(0);

  function removePressHandler() {
    updatePoints(route.params.points - parseInt(enteredPoints));
    navigation.goBack();
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Remove Points</Title>
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
        <MyButton onPress={removePressHandler} mode="flat">
          Remove
        </MyButton>
      </View>
    </ScrollView>
  );
}

export default RemovePointsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  input: {
    width: "50%",
  },
});
