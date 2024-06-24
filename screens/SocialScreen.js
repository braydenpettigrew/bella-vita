import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Title from "../components/Title";
import Post from "../components/Post";
import LoadingOverlay from "../components/LoadingOverlay";
import MyButton from "../components/MyButton";
import { useEffect, useState } from "react";
import Colors from "../constants/colors";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

function SocialScreen({ navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [imageLimit, setImageLimit] = useState(10);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data is available in AsyncStorage
        const cachedData = await AsyncStorage.getItem("posts");
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);

          // Get the latest timestamp from Firestore
          const latestTimestamp = await getLatestTimestamp();

          // If cached data is up-to-date, use it
          if (timestamp === latestTimestamp) {
            setPosts(data);
            setIsLoaded(true);
          } else {
            // If cached data is outdated, fetch the latest data from Firestore
            fetchLatestDataFromFirestore(10, true);
          }
        } else {
          // If no cached data is available, fetch the latest data from Firestore
          fetchLatestDataFromFirestore(10, true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchTotalPostCount = async () => {
      try {
        const snapshot = await getDocs(collection(db, "files"));
        setTotalPostCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching total post count:", error);
      }
    };

    fetchData();
    fetchTotalPostCount();
  }, []);

  const fetchLatestDataFromFirestore = async (
    numImages,
    isInitialLoad = false
  ) => {
    const latestTimestamp = await getLatestTimestamp();

    const q = query(
      collection(db, "files"),
      orderBy("createdAt", "desc"),
      limit(numImages)
    );

    const snapshot = await getDocs(q);
    const updatedPosts = snapshot.docs.map((doc) => doc.data());

    if (isInitialLoad) {
      setPosts(updatedPosts);
    } else {
      setPosts((prevPosts) => {
        const newPosts = updatedPosts.filter(
          (newPost) =>
            !prevPosts.some((post) => post.createdAt === newPost.createdAt)
        );
        return [...prevPosts, ...newPosts];
      });
    }

    setIsLoaded(true);
    setIsLoadingMore(false);

    // Store the fetched data and timestamp in AsyncStorage (only 10 most recent posts)
    if (isInitialLoad) {
      AsyncStorage.setItem(
        "posts",
        JSON.stringify({ data: updatedPosts, timestamp: latestTimestamp })
      );
    }
  };

  const getLatestTimestamp = async () => {
    try {
      const metadataDocRef = doc(db, "metadata", "latest");
      const metadataDocSnapshot = await getDoc(metadataDocRef);

      if (metadataDocSnapshot.exists()) {
        const latestTimestamp = metadataDocSnapshot.data().timestamp;
        return latestTimestamp;
      } else {
        console.error("No metadata document found in Firestore.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching latest timestamp:", error);
      return null;
    }
  };

  const loadMorePressedHandler = async () => {
    setIsLoadingMore(true);
    setImageLimit((prevLimit) => prevLimit + 10);
  };

  useEffect(() => {
    if (imageLimit > 10) {
      fetchLatestDataFromFirestore(imageLimit);
    }
  }, [imageLimit]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title>Bella Vita Media</Title>
      </View>
      {isLoaded ? ( // Conditional rendering based on isLoaded state
        posts.length > 0 ? (
          <ScrollView style={styles.scrollView}>
            {posts
              .slice() // Create a copy of the posts array
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort the copy in descending order based on the createdAt timestamp
              .map((item, index) => (
                <Post
                  key={index}
                  userName={item.user}
                  email={item.email}
                  image={item.url}
                  caption={item.caption}
                  timestamp={item.createdAt}
                  likes={item.likes}
                  comments={item.comments}
                />
              ))}
            <View style={styles.loadMoreContainer}>
              {posts.length < totalPostCount &&
                (isLoadingMore ? (
                  <ActivityIndicator
                    size="large"
                    color={Colors.primaryBlue}
                    style={{ marginBottom: 12 }}
                  />
                ) : (
                  <MyButton
                    style={{
                      width: "50%",
                      marginBottom: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    buttonStyle={{ backgroundColor: Colors.primaryBlue }}
                    mode="flat"
                    onPress={loadMorePressedHandler}
                    disabled={isLoadingMore}
                  >
                    Load more posts
                  </MyButton>
                ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noPostsText}>There are no posts available.</Text>
        )
      ) : (
        <LoadingOverlay />
      )}
      <View style={styles.makePostContainer}>
        <MyButton
          style={{ width: "50%" }}
          onPress={() => navigation.navigate("MakePost")}
        >
          Make a Post
        </MyButton>
      </View>
    </View>
  );
}

export default SocialScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryDarkGray,
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryBlue,
    backgroundColor: "#fff",
  },
  makePostContainer: {
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: Colors.primaryBlue,
    backgroundColor: "#fff",
  },
  loadMoreContainer: {
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 1,
    width: "100%",
  },
  noPostsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
