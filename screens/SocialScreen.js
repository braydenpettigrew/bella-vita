import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Title from "../components/Title";
import Post from "../components/Post";
import LoadingOverlay from "../components/LoadingOverlay";
import MyButton from "../components/MyButton";
import { useEffect, useState, useCallback } from "react";
import Colors from "../constants/colors";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import MyAlert from "../components/MyAlert";
import { useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

function SocialScreen({ navigation, route }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [imageLimit, setImageLimit] = useState(10);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState(route.params?.group || {});
  const navBack = route.params?.navBack;
  const [refreshing, setRefreshing] = useState(false);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(async () => {
      setImageLimit(10);
      await fetchLatestDataFromFirestore(10);
      setRefreshing(false);
    }, 2000);
  }

  useLayoutEffect(() => {
    if (navBack) {
      navigation.setOptions({
        headerLeft: () => (
          <Ionicons
            name="chevron-back-outline"
            size={32}
            color="#FFFFFF"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Groups" }],
              });
            }}
          />
        ),
      });
    }
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }) => (
        <Pressable
          onPress={() => navigation.navigate("Profile", { group: group })}
        >
          <Ionicons name="person-circle-outline" color={tintColor} size={32} />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const newMessage = route?.params?.message || false;
    setMessage(newMessage);
    if (newMessage) {
      handleShowAlert();
    }
  }, [navigation, route]);

  useEffect(() => {
    if (isFirstLoad) {
      fetchLatestDataFromFirestore(10);
      setIsFirstLoad(false);

      const fetchTotalPostCount = async () => {
        try {
          const snapshot = await getDocs(
            collection(db, "groups", group.id, "posts")
          );
          setTotalPostCount(snapshot.size);
        } catch (error) {
          console.error("Error fetching total post count:", error);
        }
      };

      fetchTotalPostCount();
    }
  }, [isFirstLoad]);

  useFocusEffect(
    useCallback(() => {
      if (!isFirstLoad) {
        fetchLatestDataFromFirestore(10);
      }
    }, [isFirstLoad])
  );

  const fetchLatestDataFromFirestore = async (
    numImages,
    isInitialLoad = false
  ) => {
    const q = query(
      collection(db, "groups", group.id, "posts"),
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

  // Function to delete a post.
  async function deletePostHandler(timestampToDelete) {
    try {
      // Reference to the collection
      const postsCollection = collection(db, "groups", group.id, "posts");

      // Query to find the document with the specified timestamp
      const q = query(
        postsCollection,
        where("createdAt", "==", timestampToDelete)
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Check if a document with the timestamp exists
      if (!querySnapshot.empty) {
        // Loop through the documents (there should typically be only one)
        querySnapshot.forEach(async (docSnapshot) => {
          // Get the document ID
          const docId = docSnapshot.id;

          // Delete the document
          await deleteDoc(doc(db, "groups", group.id, "posts", docId));

          // Refetch posts
          fetchLatestDataFromFirestore(10);
          setMessage(
            "You have successfully deleted your post! If you do not see changes, please restart the app."
          );
          handleShowAlert();
        });
      } else {
        Alert.alert(
          "Deletion Failure",
          "Cannot delete this post. Please reload the app and try again."
        );
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }

  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  return (
    <View style={styles.container}>
      {showAlert && (
        <MyAlert message={message} duration={5000} onHide={handleHideAlert} />
      )}
      <View style={styles.titleContainer}>
        <Title>Bella Vita Media</Title>
      </View>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoaded ? ( // Conditional rendering based on isLoaded state
          posts.length > 0 ? (
            <>
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
                    onDelete={deletePostHandler}
                    group={group}
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
            </>
          ) : (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>
                There are no posts available.
              </Text>
            </View>
          )
        ) : (
          <LoadingOverlay />
        )}
      </ScrollView>
      <View style={styles.makePostContainer}>
        <MyButton
          style={{ width: "50%" }}
          onPress={() => navigation.navigate("MakePost", { group: group })}
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
  noPostsContainer: {
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noPostsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
