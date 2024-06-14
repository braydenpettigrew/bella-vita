import { StyleSheet, View } from "react-native";
import Input from "../components/Input";
import ImagePicker from "../components/ImagePicker";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context";
import MyButton from "../components/MyButton";
import { storePost } from "../util/http";

function MakePostScreen({ navigation }) {
  const [image, setImage] = useState();
  const [caption, setCaption] = useState("");
  const authCtx = useContext(AuthContext);

  function onImageTaken(image) {
    setImage(image);
  }

  function onPostPressed() {
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
    <View style={styles.container}>
      <View style={styles.postButtonContainer}>
        <MyButton onPress={onPostPressed} style={styles.postButton}>
          Post
        </MyButton>
      </View>
      <ImagePicker onImageTaken={onImageTaken} />
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
    </View>
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
