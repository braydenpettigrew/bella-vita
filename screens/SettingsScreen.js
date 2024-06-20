import { ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import Colors from "../constants/colors";
import MyButton from "../components/MyButton";
import { FIREBASE_AUTH } from "../firebaseConfig";
import React from "react";

function SettingsScreen({ navigation, route }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const updatedName = route.params ? route.params.newName : null; // When a user changes their name, display this instead of user.displayName

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
            <Text style={styles.settingsText}>Email: {user.email}</Text>
          </View>
          <View style={styles.nameSettingsContainer}>
            <Text style={styles.settingsText}>
              Name: {updatedName ? updatedName : user.displayName}
            </Text>
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
    margin: 2,
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
