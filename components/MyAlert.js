import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Animated, Button } from "react-native";
import Colors from "../constants/colors";

const MyAlert = ({ message, duration = 5000, onHide }) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      hideAlert();
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const hideAlert = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onHide(); // Call onHide callback when animation completes
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.innerContainer}>
        <Text style={styles.message}>{message}</Text>
        <Button title="Dismiss" onPress={onHide} color={Colors.primaryGray} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.75,
    shadowRadius: 5,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "90%", // Ensure the container does not extend beyond the screen
    backgroundColor: Colors.primaryDarkGray,
    padding: 10,
    borderRadius: 5,
  },
  message: {
    flex: 1, // Allow text to take up remaining space
    color: "#fff",
    fontSize: 18,
    marginRight: 10, // Add some margin to the right of the text
  },
});

export default MyAlert;
