import { Alert, Image, Text, View, StyleSheet, Pressable } from "react-native";
import {
  launchCameraAsync,
  useCameraPermissions,
  PermissionStatus,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { useState } from "react";
import Colors from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

function ImagePicker({ onImageTaken }) {
  const [pickedImage, setPickedImage] = useState("");
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  async function verifyPermissions() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant camera permissions to use this app."
      );
      return false;
    }

    return true;
  }

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const image = await launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    setPickedImage(image.assets[0].uri);
    onImageTaken(image.assets[0].uri);
  }

  async function pickImageFromLibraryHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const image = await launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!image.cancelled) {
      // Check if the user cancelled the action
      setPickedImage(image.assets[0].uri);
      onImageTaken(image.assets[0].uri);
    }
  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (pickedImage) {
    imagePreview = <Image style={styles.image} source={{ uri: pickedImage }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imagePreview}>{imagePreview}</View>
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.buttonContainer} onPress={takeImageHandler}>
          <Text style={styles.buttonText}>Capture</Text>
          <Ionicons name="camera-outline" color={"white"} size={24} />
        </Pressable>
        <Pressable
          style={styles.buttonContainer}
          onPress={pickImageFromLibraryHandler}
        >
          <Text style={styles.buttonText}>Gallery</Text>
          <Ionicons name="image-outline" color={"white"} size={24} />
        </Pressable>
      </View>
    </View>
  );
}

export default ImagePicker;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    margin: 16,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryGray,
    borderRadius: 4,
  },
  image: {
    width: 300,
    height: 300,
  },
});
