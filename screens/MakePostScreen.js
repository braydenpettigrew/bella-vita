import { Alert, ScrollView, StyleSheet, View } from "react-native";
import Input from "../components/Input";
import ImagePicker from "../components/ImagePicker";
import { useState } from "react";
import MyButton from "../components/MyButton";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { FIREBASE_AUTH, db, storage } from "../firebaseConfig";
import { getAllPushTokens } from "../util/http";

function MakePostScreen({ navigation }) {
  const [uri, setUri] = useState(null);
  const [caption, setCaption] = useState("");
  const [isPostButtonDisabled, setIsPostButtonDisabled] = useState(false);
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;

  function onImageTaken(uri) {
    setUri(uri);
  }

  async function sendPushNotificationHandler() {
    const pushTokensArray = await getAllPushTokens(token);

    let allPushTokens = [];
    for (item in pushTokensArray) {
      allPushTokens.push(pushTokensArray[item].pushToken);
    }

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: allPushTokens,
        title: `${user.displayName} posted an image!`,
        body: "Open the Bella Vita app to view the image.",
      }),
    });
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

  async function onPostPressed() {
    if (uri === null) {
      Alert.alert("No Image Provided", "Please provide an image to post.");
      return;
    }
    if (caption === "") {
      Alert.alert(
        "No Caption Provided",
        "Please provide a caption to go with your post."
      );
      return;
    }
    setIsPostButtonDisabled(true);

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload image to firebase storage
    const storageRef = ref(storage, "Images/" + new Date().getTime());
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Listen for events
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // handle error
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          // save record
          const datetime = new Date().toISOString();
          await saveRecord(
            "image",
            downloadURL,
            datetime,
            user.displayName,
            user.email,
            caption,
            [],
            0
          );
          await updateLatestTimestamp(datetime);
        });
      }
    );

    setIsPostButtonDisabled(false);

    // Send notification to others (disable when testing)
    sendPushNotificationHandler();

    navigation.navigate("Social");
  }

  // Saves a record/stores a document in firestore database including the given paramaters
  async function saveRecord(
    fileType,
    url,
    createdAt,
    user,
    email,
    caption,
    comments,
    likes
  ) {
    try {
      const docRef = await addDoc(collection(db, "files"), {
        fileType,
        url,
        createdAt,
        user,
        email,
        caption,
        comments,
        likes,
      });
    } catch (e) {
      console.log("MakePostScreen Error: ", e);
    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.postButtonContainer}>
          <MyButton
            onPress={onPostPressed}
            style={styles.postButton}
            disabled={isPostButtonDisabled}
          >
            Post
          </MyButton>
        </View>
        <View style={styles.inputContainer}>
          <Input
            label="Caption"
            textInputConfig={{
              onChangeText: setCaption,
              value: caption,
              multiline: true,
              placeholder: "Enter a caption for your post...",
            }}
            style={styles.input}
          />
        </View>
        <ImagePicker onImageTaken={onImageTaken} />
      </View>
    </ScrollView>
  );
}

export default MakePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postButtonContainer: {
    alignItems: "flex-end",
    margin: 16,
  },
  postButton: {
    width: "25%",
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    width: "80%",
  },
});
