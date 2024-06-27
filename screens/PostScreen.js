import { Alert, Button, StyleSheet } from "react-native";
import Post from "../components/Post";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";
import { useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

function PostScreen({ route, navigation }) {
  const item = route.params.item;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Ionicons
          name="chevron-back-outline"
          size={32}
          color="#FFFFFF"
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  // Function to delete a post.
  async function deletePostHandler(timestampToDelete) {
    try {
      // Reference to the collection
      const postsCollection = collection(db, "files");

      // Query to find the document with the specified timestamp
      const q = query(
        postsCollection,
        where("createdAt", "==", timestampToDelete)
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if a document with the timestamp exists
      if (!querySnapshot.empty) {
        // Loop through the documents (there should typically be only one)
        querySnapshot.forEach(async (docSnapshot) => {
          // Get the document ID
          const docId = docSnapshot.id;

          // Delete the document
          await deleteDoc(doc(db, "files", docId));

          // Update the latest timestamp so that users will not cache this post anymore
          await updateLatestTimestamp(new Date().toISOString());
          Alert.alert("You have successfully deleted your post.");
        });
      } else {
        Alert.alert(
          "Deletion Failure",
          "Cannot delete this post. Please reload the app and try again."
        );
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }

  // Updates the latest timestamp in the metadata/latest folder of the database
  const updateLatestTimestamp = async (datetime) => {
    try {
      const metadataDocRef = doc(db, "metadata", "latest");
      await setDoc(metadataDocRef, { timestamp: datetime }, { merge: true });
    } catch (error) {
      console.error("Error updating latest timestamp:", error);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Post
        userName={item.user}
        email={item.email}
        image={item.url}
        caption={item.caption}
        timestamp={item.createdAt}
        likes={item.likes}
        comments={item.comments}
        onDelete={deletePostHandler}
      />
    </ScrollView>
  );
}

export default PostScreen;

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    width: "100%",
  },
});
