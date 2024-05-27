import { StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../constants/colors";

function Input({ label, invalid, style, textInputConfig }) {
  let inputStyles = [styles.input];

  if (textInputConfig && textInputConfig.multiline) {
    inputStyles.push(styles.inputMultiline);
  }

  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>
        {label}
      </Text>
      <TextInput
        {...textInputConfig}
        style={[inputStyles, invalid && styles.invalidInput]}
      />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "black",
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.primaryGray,
    color: Colors.primaryBlue,
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  invalidLabel: {
    color: Colors.error,
  },
  invalidInput: {
    backgroundColor: Colors.error,
  },
});
