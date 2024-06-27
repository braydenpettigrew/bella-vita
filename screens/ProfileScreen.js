import React, { useEffect, useState, useCallback } from "react";
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
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import Colors from "../constants/colors";

const ITEMS_PER_PAGE = 3;

function ProfileScreen({ route, navigation }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const userName = route.params?.userName || user.displayName;
  const email = route.params?.email || user.email;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchUserPosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      let q = query(
        collection(db, "files"),
        where("email", "==", email),
        orderBy("createdAt", "desc"),
        limit(ITEMS_PER_PAGE)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((doc) => doc.data());

      if (newPosts.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
    } finally {
      setIsLoadingMore(false);
      setLoading(false);
    }
  }, [email, lastVisible, isLoadingMore, hasMore]);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const handlePress = useCallback(
    (item) => {
      navigation.navigate("PostScreen", { item });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => handlePress(item)}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.2 }]}
      >
        <Image
          source={{
            uri: item.url,
            cache: "force-cache", // This will force the image to be cached
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>
    ),
    [handlePress]
  );

  const keyExtractor = useCallback((item) => item.createdAt, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 200, // Adjust this based on your item height
      offset: 200 * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.usernameText}>{userName}'s Profile</Text>
        <Text style={styles.emailText}>Email: {email}</Text>
      </View>
      <View style={styles.imagesContainer}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={1}
          onEndReached={fetchUserPosts}
          onEndReachedThreshold={0.5}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={21}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          ListFooterComponent={() =>
            isLoadingMore ? (
              <ActivityIndicator size="small" color={Colors.primaryGray} />
            ) : null
          }
        />
      </View>
      {loading && (
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
    marginBottom: 4,
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
