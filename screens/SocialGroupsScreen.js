import { Pressable, StyleSheet, Text, View } from "react-native";
import Title from "../components/Title";
import MyButton from "../components/MyButton";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_AUTH, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import MyAlert from "../components/MyAlert";
import { SUPER_ADMIN } from "../constants/admin";
import Input from "../components/Input";

function SocialGroupsScreen({ navigation }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;
  const [newGroupName, setNewGroupName] = useState("");
  const [userGroups, setUserGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  async function createGroupPressedHandler() {
    try {
      const newGroup = {
        name: newGroupName,
        createdAt: serverTimestamp(),
        users: [SUPER_ADMIN],
      };
      await addDoc(collection(db, "groups"), newGroup);
      setNewGroupName("");
      setMessage("You successfully created a new group!");
      handleShowAlert();
    } catch (error) {
      console.error("Error creating group: ", error);
    }
  }

  useEffect(() => {
    async function fetchGroups() {
      try {
        const q = query(
          collection(db, "groups"),
          where("users", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userGroups = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserGroups(userGroups);
        console.log(userGroups);
      } catch (error) {
        console.error("Error fetching groups: ", error);
      }
    }

    fetchGroups();
  }, []);

  return (
    <View style={styles.container}>
      {showAlert && (
        <MyAlert message={message} duration={5000} onHide={handleHideAlert} />
      )}
      <Title>Groups</Title>
      {user.uid === SUPER_ADMIN && (
        <View>
          <Input
            label="New Group Name:"
            style={styles.input}
            textInputConfig={{
              onChangeText: setNewGroupName,
              value: newGroupName,
              placeholder: "Enter name...",
            }}
          />
          <MyButton onPress={createGroupPressedHandler}>Create Group</MyButton>
        </View>
      )}
      <Text>Groups:</Text>
      {userGroups.map((userGroup) => (
        <View key={userGroup.id}>
          <Pressable
            onPress={() => navigation.navigate("Social", { group: userGroup })}
          >
            <Text>{userGroup.name}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export default SocialGroupsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  input: {
    width: "80%",
    height: 60,
    marginVertical: 8,
  },
});
