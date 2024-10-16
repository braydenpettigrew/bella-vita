import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

function MyButton({ children, onPress, mode, style, buttonStyle, disabled }) {
  return (
    <View style={style}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        disabled={disabled}
      >
        <View
          style={[styles.button, buttonStyle, mode === "flat" && styles.flat]}
        >
          <Text style={[styles.buttonText, mode === "flat" && styles.flatText]}>
            {children}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default MyButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    padding: 8,
    backgroundColor: Colors.primaryRed,
  },
  flat: {
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  flatText: {
    color: Colors.primaryBlue,
  },
  pressed: {
    opacity: 0.75,
    borderRadius: 4,
  },
});
