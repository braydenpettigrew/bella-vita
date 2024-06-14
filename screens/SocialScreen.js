import { ScrollView, StyleSheet, View } from "react-native";
import Title from "../components/Title";
import Post from "../components/Post";
import MyButton from "../components/MyButton";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchPosts } from "../util/http";
import Colors from "../constants/colors";

function SocialScreen({ navigation }) {
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          const posts = await fetchPosts(authCtx.token);
          const postsArray = Object.values(posts).reverse();
          setPosts(postsArray);
        } catch (error) {
          console.log("Social Screen Error: ", error);
        }
      }

      fetchData();
    }, [navigation, authCtx.token])
  );

  const [posts, setPosts] = useState([]);
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Title>Bella Vita Media</Title>
      </View>
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
});
