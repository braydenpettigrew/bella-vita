import { Alert, Image, Text, View, StyleSheet } from "react-native";
import {
  launchCameraAsync,
  useCameraPermissions,
  PermissionStatus,
} from "expo-image-picker";
import { useState } from "react";
import IconButton from "./IconButton";
import Colors from "../constants/colors";

function ImagePicker({ onImageTaken }) {
  const [pickedImage, setPickedImage] = useState();
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
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    // console.log(image.assets[0].base64);
    setPickedImage(image.assets[0].base64);
    onImageTaken(image.assets[0].base64);
  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (pickedImage) {
    imagePreview = (
      <Image
        style={styles.image}
        source={{ uri: `data:image/jpeg;base64,${pickedImage}` }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imagePreview}>{imagePreview}</View>
      <IconButton
        icon="camera-outline"
        color={Colors.primaryBlue}
        size={24}
        onPress={takeImageHandler}
      />
    </View>
  );
}

export default ImagePicker;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: "center",
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
