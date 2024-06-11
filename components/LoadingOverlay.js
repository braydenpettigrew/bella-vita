import { ActivityIndicator, StyleSheet, View } from "react-native";

function LoadingOverlay() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
  loadingContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
