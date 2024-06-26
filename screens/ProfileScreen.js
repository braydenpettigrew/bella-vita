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
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import MyButton from "../components/MyButton";

function ProfileScreen({ route, navigation }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const userName = route.params?.userName || user.displayName;
  const email = route.params?.email || user.email;
  const [posts, setPosts] = useState([]);
  const [loadedImages, setLoadedImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [imageLimit, setImageLimit] = useState(15);
  const [totalPostCount, setTotalPostCount] = useState(0);

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
      const q = query(
        collection(db, "files"),
        where("email", "==", email),
        limit(imageLimit)
      );
      const snapshot = await getDocs(q);
      const updatedPosts = snapshot.docs.map((doc) => doc.data());
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
    }

    setIsLoadingMore(false);
  }

  const handlePress = (item) => {
    navigation.navigate("PostScreen", { item });
  };

  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.2 }]}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        onLoad={handleImageLoad}
      />
    </Pressable>
  );

  const loadMorePressedHandler = async () => {
    setIsLoadingMore(true);
    setImageLimit((prevLimit) => prevLimit + 15);
  };

  useEffect(() => {
    if (imageLimit > 3) {
      fetchUserPosts(imageLimit);
    }
  }, [imageLimit]);

  useEffect(() => {
    const fetchTotalPostCount = async () => {
      try {
        const q = query(collection(db, "files"), where("email", "==", email));
        const snapshot = await getDocs(q);
        setTotalPostCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching total post count:", error);
      }
    };

    fetchTotalPostCount();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.usernameText}>{userName}'s Profile</Text>
        <Text style={styles.emailText}>Email: {email}</Text>
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
      {posts.length < totalPostCount && (
        <View style={styles.loadMoreButtonContainer}>
          <MyButton
            style={styles.loadMoreButton}
            buttonStyle={{ backgroundColor: Colors.primaryBlue }}
            mode="flat"
            onPress={loadMorePressedHandler}
            disabled={isLoadingMore}
          >
            Load more posts
          </MyButton>
        </View>
      )}
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
    paddingHorizontal: 16,
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
    justifyContent: "center",
    borderBottomWidth: 2,
    borderColor: Colors.primaryGray,
    margin: 16,
  },
  imagesContainer: {
    flex: 10,
    padding: 1,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryDarkBlue,
  },
  emailText: {
    fontSize: 14,
    color: Colors.primaryDarkGray,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreButton: {
    width: "50%",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreButtonContainer: {
    alignItems: "center",
  },
});
