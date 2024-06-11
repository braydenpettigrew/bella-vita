import { ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/MyButton";
import Colors from "../constants/colors";

function SettingsScreen({ navigation }) {
  const authCtx = useContext(AuthContext);

  function changeNamePressedHandler() {
    navigation.navigate("ChangeName");
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Title>Settings</Title>
        </View>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Account Settings</Text>
        </View>
        <View>
          <View style={styles.nameSettingsContainer}>
            <Text style={styles.settingsText}>Name: {authCtx.name}</Text>
            <MyButton
              onPress={changeNamePressedHandler}
              buttonStyle={{ backgroundColor: Colors.primaryBlue }}
            >
              Change
            </MyButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    alignItems: "center",
  },
  nameSettingsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryGray,
    borderRadius: 8,
  },
  subtitleContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsText: {
    fontSize: 18,
    fontWeight: "400",
  },
});
