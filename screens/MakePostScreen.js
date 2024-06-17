import { Alert, ScrollView, StyleSheet, View } from "react-native";
import Input from "../components/Input";
import ImagePicker from "../components/ImagePicker";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/MyButton";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { getAllPushTokens } from "../util/http";

function MakePostScreen({ navigation }) {
  const [uri, setUri] = useState(null);
  const [caption, setCaption] = useState("");
  const [isPostButtonDisabled, setIsPostButtonDisabled] = useState(false);
  const authCtx = useContext(AuthContext);

  function onImageTaken(uri) {
    setUri(uri);
  }

  async function sendPushNotificationHandler() {
    const pushTokensArray = await getAllPushTokens(authCtx.token);

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushTokensArray,
        title: `${authCtx.name} posted an image!`,
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
            authCtx.name,
            caption
          );
          await updateLatestTimestamp(datetime);
        });
      }
    );

    setIsPostButtonDisabled(false);

    // Send notification to others
    sendPushNotificationHandler();

    navigation.navigate("Social");
  }

  async function saveRecord(fileType, url, createdAt, user, caption) {
    try {
      const docRef = await addDoc(collection(db, "files"), {
        fileType,
        url,
        createdAt,
        user,
        caption,
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
