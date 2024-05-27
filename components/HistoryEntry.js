import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

function HistoryEntry({ children }) {
  let item = <Text></Text>;
  if (children.pointsAdded) {
    item = (
      <Text style={styles.text}>
        {children.user} added {children.pointsAdded} point(s){"\n"}Reason:{" "}
        {children.reason}
      </Text>
    );
  } else {
    item = (
      <Text style={styles.text}>
        {children.user} removed {children.pointsRemoved} point(s){"\n"}Reason:{" "}
        {children.reason}
      </Text>
    );
  }
  return <View style={styles.container}>{item}</View>;
}

export default HistoryEntry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    width: "80%",
    borderRadius: 8,
    backgroundColor: Colors.primaryGray,
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  text: {
    padding: 8,
    color: Colors.primaryDarkBlue,
    fontSize: 16,
  },
});
