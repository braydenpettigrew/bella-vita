import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Title from "../components/Title";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/auth-context";
import Input from "../components/Input";
import MyButton from "../components/myButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

function SettingsScreen() {
  const authCtx = useContext(AuthContext);
  const [name, setName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  function changeNamePressedHandler() {
    authCtx.changeName(name);
    setModalVisible(false);
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Title>Settings</Title>
        <View style={styles.nameSettingsContainer}>
          <Text style={styles.settingsText}>Name: {authCtx.name}</Text>
          <MyButton onPress={() => setModalVisible(true)}>Change</MyButton>
        </View>
      </View>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Input
                label="New Name:"
                style={styles.input}
                textInputConfig={{
                  onChangeText: setName,
                }}
              />
              <MyButton onPress={changeNamePressedHandler}>
                Change Name
              </MyButton>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  nameSettingsContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsText: {
    fontSize: 18,
    fontWeight: "400",
  },
  input: {
    marginVertical: 16,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "75%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
