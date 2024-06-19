import { Alert, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";
import { deleteHistory } from "../util/http";
import IconButton from "./IconButton";
import { FIREBASE_AUTH } from "../firebaseConfig";

function HistoryEntry({ children, onDeleteHistory }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;

  function makeTimestamp(timestamp) {
    const date = new Date(timestamp);

    // Get day, month, hours, and minutes
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert hours to 12-hour format
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Format the date as DD/MM Time
    const formattedDate = `${month}/${day} ${hours}:${minutes} ${ampm}`;
    return formattedDate;
  }

  // Function that alerts the user and deletes the history entry on confirmation
  function deleteEntry() {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this history entry? It will be deleted forever.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            deleteHistory(children.timestamp, token);
            onDeleteHistory(children.timestamp);
          },
          style: "destructive",
        },
      ]
    );
  }

  let item = <Text></Text>;
  if (children.pointsAdded) {
    item = (
      <View style={styles.deleteContainer}>
        <View
          style={[
            styles.entryContainer,
            user.email === "brayden@thepettigrews.org" && { flex: 1 },
          ]}
        >
          <Text style={styles.text}>
            {children.user} added {children.pointsAdded} point(s){"\n"}Reason:{" "}
            {children.reason}
          </Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.text}>{makeTimestamp(children.timestamp)}</Text>
          </View>
        </View>
        {user.email === "brayden@thepettigrews.org" && (
          <IconButton
            icon="trash-outline"
            size={24}
            color={Colors.primaryRed}
            onPress={deleteEntry}
          />
        )}
      </View>
    );
  } else {
    item = (
      <View style={styles.deleteContainer}>
        <View
          style={[
            styles.entryContainer,
            user.email === "brayden@thepettigrews.org" && { flex: 1 },
          ]}
        >
          <Text style={styles.text}>
            {children.user} removed {children.pointsRemoved} point(s){"\n"}
            Reason: {children.reason}
          </Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.text}>{makeTimestamp(children.timestamp)}</Text>
          </View>
        </View>
        {user.email === "brayden@thepettigrews.org" && (
          <IconButton
            icon="trash-outline"
            size={24}
            color={Colors.primaryRed}
            onPress={deleteEntry}
          />
        )}
      </View>
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
    justifyContent: "center",
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
  deleteContainer: {
    flexDirection: "row",
  },
  entryContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  timestampContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.primaryDarkBlue,
    margin: 4,
  },
  text: {
    padding: 8,
    color: Colors.primaryDarkBlue,
    fontSize: 16,
  },
  imageButtons: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
