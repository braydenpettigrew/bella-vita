import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { FIREBASE_AUTH, db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";

function ProfileScreen({ route, navigation }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const userName = route.params?.userName || user.displayName;
  const email = route.params?.email || user.email;
  const [posts, setPosts] = useState([]);
  const [loadedImages, setLoadedImages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && loadedImages === posts.length) {
      setLoading(false);
    }
  }, [loadedImages, posts]);

  async function fetchUserPosts() {
    try {
      const q = query(collection(db, "files"), where("email", "==", email));
      const snapshot = await getDocs(q);
      const updatedPosts = snapshot.docs.map((doc) => doc.data());
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
    }
  }

  const handlePress = (item) => {
    navigation.navigate("PostScreen", { item });
  };

  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => handlePress(item)} style={styles.item}>
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        onLoad={handleImageLoad}
        onError={(error) =>
          console.error(`Image failed to load for item: ${item.url}`, error)
        }
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.usernameText}>{userName}'s Profile</Text>
      </View>
      <View style={styles.imagesContainer}>
        <FlatList
          data={posts
            .slice() // Create a copy of the posts array
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} // Sort the copy in descending order based on the createdAt timestamp
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      </View>
      {loadedImages < posts.length && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primaryGray} />
        </View>
      )}
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  item: {
    flex: 1,
    margin: 2,
    aspectRatio: 1, // Ensure the images are square
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primaryGray,
    margin: 16,
  },
  imagesContainer: {
    flex: 3,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primaryDarkBlue,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
