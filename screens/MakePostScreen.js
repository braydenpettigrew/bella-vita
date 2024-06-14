import { Alert, ScrollView, StyleSheet, View } from "react-native";
import Input from "../components/Input";
import ImagePicker from "../components/ImagePicker";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/MyButton";
import { storePost } from "../util/http";

function MakePostScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isPostButtonDisabled, setIsPostButtonDisabled] = useState(false);
  const authCtx = useContext(AuthContext);

  function onImageTaken(image) {
    setImage(image);
  }

  async function onPostPressed() {
    if (image === null) {
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
    storePost(
      {
        caption: caption,
        user: authCtx.name,
        image: image,
        timestamp: Date.now(),
      },
      authCtx.token
    );
    navigation.navigate("Social");
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
