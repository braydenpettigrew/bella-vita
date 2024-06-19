import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../constants/colors";
import IconButton from "./IconButton";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_AUTH, db } from "../firebaseConfig";

function Post({ userName, email, image, caption, timestamp, likes, comments }) {
  // State variable that determines if the heart icon is full or not
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [postComments, setPostComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentDisabled, setCommentDisabled] = useState(false);
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  useEffect(() => {
    // Fetch initial likes count when component mounts
    async function fetchLikes() {
      try {
        const q = query(
          collection(db, "files"),
          where("createdAt", "==", timestamp)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          setNumLikes(docSnapshot.data().likes);
        } else {
          console.log("No document found with the given timestamp.");
        }
      } catch (error) {
        console.error("Error fetching likes: ", error);
      }
    }

    // Fetch initial comments when component mounts
    async function fetchComments() {
      try {
        const q = query(
          collection(db, "files"),
          where("createdAt", "==", timestamp)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          setPostComments(docSnapshot.data().comments);
        } else {
          console.log("No document found with the given timestamp.");
        }
      } catch (error) {
        console.error("Error fetching likes: ", error);
      }
    }

    fetchLikes();
    fetchComments();
  }, [timestamp]);

  // Updates the latest timestamp in the metadata/latest folder of the database
  const updateLatestTimestamp = async (datetime) => {
    try {
      const metadataDocRef = doc(db, "metadata", "latest");
      await setDoc(metadataDocRef, { timestamp: datetime }, { merge: true });
    } catch (error) {
      console.error("Error updating latest timestamp:", error);
    }
  };

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

  // Function to handle when a user likes an image
  async function handleLikePress() {
    setLiked((liked) => !liked);
    const q = query(
      collection(db, "files"),
      where("createdAt", "==", timestamp)
    );

    try {
      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if the document exists
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const postDocRef = doc(db, "files", docSnapshot.id);

        // Update the likes count
        await updateDoc(
          postDocRef,
          {
            likes: liked
              ? docSnapshot.data().likes - 1
              : docSnapshot.data().likes + 1,
          },
          { merge: true }
        );

        const updatedDoc = await getDoc(postDocRef);
        const updatedLikes = updatedDoc.data().likes;
        setNumLikes(updatedLikes);
      } else {
        console.log("No document found with the given timestamp.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }

    updateLatestTimestamp(new Date(new Date().toISOString()));
  }

  // Function to handle when a user presses the comment button
  async function handleCommentPress() {
    setCommentDisabled(true);
    if (commentInput.trim() === "") {
      setCommentDisabled(false);
      setCommentInput("");
      return;
    }

    const q = query(
      collection(db, "files"),
      where("createdAt", "==", timestamp)
    );

    try {
      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if the document exists
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const postDocRef = doc(db, "files", docSnapshot.id);

        // Get the current comments array
        const currentComments = docSnapshot.data().comments;

        // Update the likes count
        await updateDoc(
          postDocRef,
          {
            comments: [
              ...currentComments,
              { message: commentInput, user: user.displayName },
            ],
          },
          { merge: true }
        );

        const updatedDoc = await getDoc(postDocRef);
        const updatedComments = updatedDoc.data().comments;
        setPostComments(updatedComments);
      } else {
        console.log("No document found with the given timestamp.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    setCommentInput("");
    setCommentDisabled(false);

    updateLatestTimestamp(new Date(new Date().toISOString()));
  }

  return (
    <View style={styles.container}>
      <View style={styles.postHeaderContainer}>
        <Text style={styles.userNameText}>{userName}</Text>
        <Text>{makeTimestamp(timestamp)}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: image }} />
      </View>
      <View style={styles.belowImageContainer}>
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{caption}</Text>
        </View>
        <View style={styles.likeContainer}>
          <IconButton
            icon={liked ? "heart" : "heart-outline"}
            size={24}
            color={Colors.primaryRed}
            onPress={handleLikePress}
          />
          <Text>{numLikes}</Text>
        </View>
      </View>
      <View style={styles.commentContainer}>
        <View style={styles.commentsHeaderContainer}>
          <Text style={styles.commentsHeaderText}>Comments</Text>
        </View>
        {postComments?.map((comment, index) => (
          <Text key={index} style={styles.commentsText}>
            {comment.user}: {comment.message}
          </Text>
        ))}
        <View style={styles.commentSubContainer}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Comment..."
            />
          </View>
          <IconButton
            icon="chatbubbles-outline"
            size={24}
            color={Colors.primaryRed}
            onPress={handleCommentPress}
            disabled={commentDisabled}
          />
        </View>
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
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16,
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
  belowImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likeContainer: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  commentContainer: {
    margin: 16,
  },
  commentSubContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  commentsHeaderContainer: {
    marginLeft: -16,
    marginBottom: 12,
  },
  commentsHeaderText: {
    fontSize: 18,
    color: Colors.primaryBlue,
    fontWeight: "bold",
  },
  commentsText: {
    fontSize: 16,
    marginVertical: 4,
  },
  commentInputContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.primaryGray,
    borderRadius: 8,
  },
  commentInput: {
    padding: 8,
    fontSize: 16,
  },
});
