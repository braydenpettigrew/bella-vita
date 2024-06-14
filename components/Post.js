import { Image, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";

function Post({ userName, image, caption, timestamp }) {
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

  return (
    <View style={styles.container}>
      <View style={styles.postHeaderContainer}>
        <Text style={styles.userNameText}>{userName}</Text>
        <Text>{makeTimestamp(timestamp)}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: `data:image/jpeg;base64,${image}` }}
        />
      </View>
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>{caption}</Text>
      </View>
    </View>
  );
}

export default Post;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
  },
  postHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    alignItems: "center",
  },
  captionContainer: {
    alignItems: "center",
  },
  userNameText: {
    fontWeight: "bold",
    fontSize: 18,
    color: Colors.primaryBlue,
  },
  captionText: {
    fontSize: 16,
  },
  image: {
    width: 300,
    height: 300,
    margin: 16,
  },
});
