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
import Colors from "../constants/colors";
import LoadingOverlay from "../components/LoadingOverlay";

function SocialGroupsScreen({ navigation }) {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const token = user.stsTokenManager.accessToken;
  const [newGroupName, setNewGroupName] = useState("");
  const [userGroups, setUserGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
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

  // Fetch all groups that the user is a part of.
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
        setLoadingGroups(false);
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
      <Title>My Groups</Title>
      {loadingGroups ? (
        <LoadingOverlay />
      ) : userGroups.length > 0 ? (
        userGroups.map((userGroup) => (
          <View key={userGroup.id} style={styles.groupContainer}>
            <Pressable
              onPress={() =>
                navigation.navigate("Social", { group: userGroup })
              }
            >
              <Text style={styles.groupText}>{userGroup.name}</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text>
          You are not a part of any groups. Please ask the app administrator to
          add you to a group!
        </Text>
      )}
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoText}>
          Note: Currently, users do not have the ability to create groups.
          Please ask the app administrator to create a group for you.
        </Text>
      </View>
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
  groupContainer: {
    backgroundColor: Colors.primaryGray,
    margin: 16,
    borderRadius: 4,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    height: 40,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  groupText: {
    fontSize: 16,
    color: Colors.primaryBlue,
  },
  infoTextContainer: {
    margin: 16,
  },
  infoText: {
    textAlign: "center",
    color: Colors.primaryDarkGray,
  },
});
