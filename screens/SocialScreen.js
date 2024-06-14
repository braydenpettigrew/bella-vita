import { ScrollView, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import Post from "../components/Post";
import LoadingOverlay from "../components/LoadingOverlay";
import MyButton from "../components/MyButton";
import { useCallback, useLayoutEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchPosts } from "../util/http";
import Colors from "../constants/colors";
import IconButton from "../components/IconButton";

function SocialScreen({ navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [postsExist, setPostsExist] = useState(true);
  const [posts, setPosts] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const postsData = await fetchPosts(authCtx.token);
      if (postsData === null) {
        setPostsExist(false);
        setIsLoaded(true);
        return;
      }
      const postsArray = Object.values(postsData).reverse();
      setPosts(postsArray);
      setPostsExist(true);
    } catch (error) {
      console.log("Social Screen Error: ", error);
    }
    setIsLoaded(true);
  }, [authCtx.token]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({ tintColor }) => (
        <View
          style={{
            position: "absolute",
            left: -12,
          }}
        >
          <IconButton
            icon="refresh"
            size={24}
            color={tintColor}
            onPress={fetchData}
          />
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title>Bella Vita Media</Title>
      </View>
      {isLoaded ? ( // Conditional rendering based on isLoaded state
        postsExist ? (
          <ScrollView style={styles.scrollView}>
            {posts.map((item, index) => (
              <Post
                key={index}
                userName={item.user}
                image={item.image}
                caption={item.caption}
                timestamp={item.timestamp}
              />
            ))}
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
  scrollView: {
    flexGrow: 1,
    width: "100%",
  },
  noPostsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
