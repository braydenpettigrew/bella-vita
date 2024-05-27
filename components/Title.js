import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

function Title({ children }) {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

export default Title;

const styles = StyleSheet.create({
  titleContainer: {
    margin: 16,
    backgroundColor: Colors.primaryYellow,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 3,
    width: 200, // Example width
    height: 50, // Example height
  },
  title: {
    padding: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
