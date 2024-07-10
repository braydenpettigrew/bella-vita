import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Colors from "../constants/colors";
import IconButton from "./IconButton";
import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_AUTH, db } from "../firebaseConfig";
import MyButton from "./MyButton";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { useNavigation } from "@react-navigation/native";

function Post({
  userName,
  email,
  image,
  caption,
  timestamp,
  likes,
  comments,
  onDelete,
  group,
}) {
  // State variable that determines if the heart icon is full or not
  const [liked, setLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [postComments, setPostComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentDisabled, setCommentDisabled] = useState(false);
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;
  const navigation = useNavigation();
  const [likedByList, setLikedByList] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  function toggleDropdown() {
    setDropdownVisible(!dropdownVisible);
  }

  useEffect(() => {
    // Fetch initial likes count when component mounts
    async function fetchLikes() {
      try {
        const q = query(
          collection(db, "groups", group.id, "posts"),
          where("createdAt", "==", timestamp)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          setNumLikes(docSnapshot.data().likes);
          uidToDisplayName(docSnapshot.data().likedBy);
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
          collection(db, "groups", group.id, "posts"),
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
        console.error("Error fetching comments: ", error);
      }
    }

    fetchLikes();
    fetchComments();
  }, [timestamp]);

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

  async function uidToDisplayName(uidList) {
    if (uidList?.length > 0) {
      const displayNames = [];
      const usersQuery = query(
        collection(db, "users"),
        where("uid", "in", uidList)
      );
      const querySnapshot = await getDocs(usersQuery);

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        displayNames.push(userData.displayName);
      });
      setLikedByList(displayNames);
    } else {
      setLikedByList([]);
    }
  }

  // Function to handle when a user likes an image
  async function handleLikePress() {
    setLiked((liked) => !liked);

    try {
      const q = query(
        collection(db, "groups", group.id, "posts"),
        where("createdAt", "==", timestamp)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];

        if (docSnapshot.exists()) {
          const postDocRef = doc(
            db,
            "groups",
            group.id,
            "posts",
            docSnapshot.id
          );
          const currentLikes = docSnapshot.data().likes || 0;
          let likedBy = docSnapshot.data().likedBy || []; // Initialize likedBy if it's undefined

          if (likedBy.includes(user.uid)) {
            // Remove user from likedBy
            likedBy = likedBy.filter((uid) => uid !== user.uid);
          } else {
            // Add user to likedBy, and send notification to user that their post was liked
            likedBy.push(user.uid);

            // Retrieve the correct push token from firestore
            let pushToken = [];
            const usersQuery = query(
              collection(db, "users"),
              where("email", "==", docSnapshot.data().email)
            );
            const querySnapshot = await getDocs(usersQuery);

            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              pushToken.push(userData.pushToken);
            });

            // Prepare data object to send in the notification
            const notificationItem = {
              user: userName,
              email: email,
              url: image,
              caption: caption,
              createdAt: timestamp,
              likes: likedBy,
              comments: docSnapshot.data().comments,
            };

            await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: pushToken,
                title: group.name,
                body: `${user.displayName} liked your image!`,
                data: { item: notificationItem, screen: "Post", group: group },
              }),
            });
          }
          uidToDisplayName(likedBy);

          // Update likes count and likedBy array
          await updateDoc(
            postDocRef,
            {
              likes: likedBy.length,
              likedBy: likedBy,
            },
            { merge: true }
          );

          // Fetch updated document
          const updatedDoc = await getDoc(postDocRef);
          const updatedLikes = updatedDoc.data().likes || 0;

          setNumLikes(updatedLikes);
        } else {
          console.log("Document does not exist.");
        }
      } else {
        console.log("No document found with the given timestamp.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const q = query(
          collection(db, "groups", group.id, "posts"),
          where("createdAt", "==", timestamp)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          const likedBy = docSnapshot.data().likedBy || [];

          // Check if current user has liked the post
          const alreadyLiked = likedBy.includes(user.uid);
          setLiked(alreadyLiked);

          // Update likes count
          setNumLikes(docSnapshot.data().likes);
          uidToDisplayName(docSnapshot.data().likedBy);
          // Update comments
          setPostComments(docSnapshot.data().comments);
        } else {
          console.log("No document found with the given timestamp.");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }

    fetchInitialData();
  }, [timestamp]);

  // Function to handle when a user presses the comment button
  async function handleCommentPress() {
    setCommentDisabled(true);
    if (commentInput.trim() === "") {
      setCommentDisabled(false);
      setCommentInput("");
      return;
    }

    const q = query(
      collection(db, "groups", group.id, "posts"),
      where("createdAt", "==", timestamp)
    );

    try {
      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if the document exists
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const postDocRef = doc(db, "groups", group.id, "posts", docSnapshot.id);

        // Get the current comments array
        const currentComments = docSnapshot.data().comments;

        // Update the likes count
        await updateDoc(
          postDocRef,
          {
            comments: [
              ...currentComments,
              {
                message: commentInput,
                user: user.displayName,
                uid: user.uid,
                timestamp: Date.now(),
              },
            ],
          },
          { merge: true }
        );

        const updatedDoc = await getDoc(postDocRef);
        const updatedComments = updatedDoc.data().comments;
        setPostComments(updatedComments);

        // Retrieve the correct push token from firestore
        let pushToken = [];
        const usersQuery = query(
          collection(db, "users"),
          where("email", "==", docSnapshot.data().email)
        );
        const usersQuerySnapshot = await getDocs(usersQuery);

        usersQuerySnapshot.forEach((doc) => {
          const userData = doc.data();
          pushToken.push(userData.pushToken);
        });

        // Prepare data object to send in the notification
        const notificationItem = {
          user: userName,
          email: email,
          url: image,
          caption: caption,
          createdAt: timestamp,
          likes: updatedDoc.data().likes,
          comments: updatedComments,
        };

        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: pushToken,
            title: group.name,
            body: `${user.displayName} commented on your image!`,
            data: { item: notificationItem, screen: "Post", group: group },
          }),
        });
      } else {
        console.log("No document found with the given timestamp.");
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    setCommentInput("");
    setCommentDisabled(false);
  }

  // Function  to delete a post
  function showDeleteConfirmationAlert() {
    Alert.alert(
      "Warning",
      "Deleting this post will delete it forever. Are you sure that you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(timestamp),
        },
      ],
      { cancelable: false }
    );
  }

  // Handle when a user long presses on their own comment.
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCommentInput, setEditCommentInput] = useState("");
  const [commentToUpdate, setCommentToUpdate] = useState(null);
  const [editCommentButtonDisabled, setEditCommentButtonDisabled] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleLongPress = (comment) => {
    if (comment.uid !== user.uid) {
      return;
    }
    if (!comment.timestamp || !comment.uid) {
      Alert.alert("Error Editing Comment", "This comment is too old to edit.");
      return;
    }
    setCommentToUpdate(comment);
    setEditCommentInput(comment.message);
    setEditModalVisible(true);
  };

  async function handleEditComment(updatedComment) {
    if (commentToUpdate.message === updatedComment) {
      Alert.alert(
        "Error Editing Comment",
        "You must change the comment in order to edit it."
      );
    } else {
      setEditCommentButtonDisabled(true);
      setIsEditing(true);
      try {
        const q = query(
          collection(db, "groups", group.id, "posts"),
          where("createdAt", "==", timestamp)
        );

        // Execute the query
        const querySnapshot = await getDocs(q);

        // Check if the document exists
        if (!querySnapshot.empty) {
          const docSnapshot = querySnapshot.docs[0];
          const postDocRef = doc(
            db,
            "groups",
            group.id,
            "posts",
            docSnapshot.id
          );

          // Get the current comments array
          const currentComments = docSnapshot.data().comments;

          // Find the comment to update based on its timestamp
          const updatedComments = currentComments.map((comment) => {
            if (comment.timestamp === commentToUpdate.timestamp) {
              return {
                ...comment,
                message: updatedComment,
                timestamp: Date.now(),
              };
            } else {
              return comment;
            }
          });

          // Update Firestore document with the updated comments
          await updateDoc(postDocRef, {
            comments: updatedComments,
          });

          // Optionally, update local state or trigger a refresh
          const updatedDoc = await getDoc(postDocRef);
          const updatedCommentsFromFirestore = updatedDoc.data().comments;
          setPostComments(updatedCommentsFromFirestore);
          setEditCommentButtonDisabled(false);
          setIsEditing(false);
          setEditModalVisible(false);
        } else {
          console.log("No document found with the given timestamp.");
          setEditCommentButtonDisabled(false);
          setIsEditing(false);
          setEditModalVisible(false);
        }
      } catch (error) {
        console.error("Error updating document: ", error);
        setEditCommentButtonDisabled(false);
        setIsEditing(false);
        setEditModalVisible(false);
      }
    }
  }

  const imageZoomRef = useRef();

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!setEditModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Comment</Text>
            <View style={styles.editCommentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={editCommentInput}
                onChangeText={setEditCommentInput}
                placeholder="Comment..."
              />
            </View>
            <View style={styles.editButtonsContainer}>
              <MyButton
                style={styles.button}
                buttonStyle={{ backgroundColor: Colors.primaryBlue }}
                disabled={editCommentButtonDisabled}
                onPress={() => handleEditComment(editCommentInput)}
              >
                {isEditing ? <ActivityIndicator /> : "Edit"}
              </MyButton>
              <MyButton
                style={styles.button}
                onPress={() => setEditModalVisible(!editModalVisible)}
              >
                Cancel
              </MyButton>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.postHeaderContainer}>
        <Pressable
          onPress={() => {
            navigation.navigate("Profile", {
              userName: userName,
              email: email,
              group: group,
            });
          }}
        >
          <Text style={styles.userNameText}>{userName}</Text>
        </Pressable>
        <Text>{makeTimestamp(timestamp)}</Text>
        {user.email === email && (
          <IconButton
            icon={"trash"}
            size={24}
            color={Colors.primaryRed}
            onPress={showDeleteConfirmationAlert}
          />
        )}
      </View>
      <View style={styles.imageContainer}>
        <ImageZoom
          uri={image}
          style={styles.image}
          ref={imageZoomRef}
          isDoubleTapEnabled
          isPanEnabled={false}
          doubleTapScale={1}
          onDoubleTap={() => {
            if (liked === false) {
              handleLikePress();
            }
          }}
          onPinchEnd={() => {
            imageZoomRef.current?.reset();
          }}
        />
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
          <IconButton
            icon={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={24}
            color={Colors.primaryRed}
            onPress={toggleDropdown}
          />
        </View>
      </View>
      {dropdownVisible && (
        <>
          <Text style={styles.commentsHeaderText}>Liked By</Text>
          <View style={styles.dropdown}>
            {likedByList.map((uid) => (
              <Text
                key={uid}
                style={[
                  styles.commentsText,
                  { color: Colors.primaryBlue, fontWeight: "500" },
                ]}
              >
                {uid}
              </Text>
            ))}
          </View>
        </>
      )}
      <View style={styles.commentContainer}>
        <View style={styles.commentsHeaderContainer}>
          <Text style={styles.commentsHeaderText}>Comments</Text>
        </View>
        {postComments?.map((comment, index) => (
          <TouchableOpacity
            key={index}
            onLongPress={() => handleLongPress(comment)}
            activeOpacity={1}
          >
            <Text style={styles.commentsText}>
              <Text style={{ color: Colors.primaryBlue, fontWeight: "500" }}>
                {comment.user}{" "}
              </Text>{" "}
              {comment.message}
            </Text>
          </TouchableOpacity>
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
          <MyButton
            onPress={handleCommentPress}
            disabled={commentDisabled}
            style={{ marginLeft: 12, marginTop: 1 }}
            buttonStyle={{ backgroundColor: Colors.primaryBlue }}
          >
            Send
          </MyButton>
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
    zIndex: 0,
  },
  postHeaderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  imageContainer: {
    alignItems: "center",
    zIndex: 2,
  },
  captionContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 16,
    zIndex: 1,
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
  editCommentInputContainer: {
    justifyContent: "center",
    backgroundColor: Colors.primaryGray,
    borderRadius: 8,
    marginBottom: 12,
    width: 275,
  },
  commentInput: {
    padding: 8,
    fontSize: 16,
  },
  dropdown: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 12,
    marginHorizontal: 6,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primaryDarkBlue,
    marginBottom: 15,
    textAlign: "center",
  },
  editButtonsContainer: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: Colors.primaryGray,
  },
});
