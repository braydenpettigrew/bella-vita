import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import Post from "../components/Post";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";
import { useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

function PostScreen({ route, navigation }) {
  const item = route.params.item;
  const navBack = route.params.navBack;
  const group = route.params?.group;

  useLayoutEffect(() => {
    if (navBack) {
      navigation.setOptions({
        headerLeft: () => (
          <Ionicons
            name="chevron-back-outline"
            size={32}
            color="#FFFFFF"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  { name: "Groups" },
                  { name: "Social", params: { group: group } },
                ],
              });
            }}
          />
        ),
      });
    }
  }, [navigation]);

  // Function to delete a post.
  async function deletePostHandler(timestampToDelete) {
    try {
      // Reference to the collection
      const postsCollection = collection(db, "groups", group.id, "posts");

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
          await deleteDoc(doc(db, "groups", group.id, "posts", docId));

          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Social",
                params: {
                  message:
                    "You have successfully deleted your post! If you do not see changes, please restart the app.",
                  group: group,
                },
              },
            ],
          });
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
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
          group={group}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default PostScreen;

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    width: "100%",
  },
  container: {
    flex: 1,
  },
});
