import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB73AZKXMGzg8oLSEoEMhXlcvkOjAjBtZQ",
  authDomain: "bellavita-7a30f.firebaseapp.com",
  databaseURL: "https://bellavita-7a30f-default-rtdb.firebaseio.com",
  projectId: "bellavita-7a30f",
  storageBucket: "bellavita-7a30f.appspot.com",
  messagingSenderId: "533891626769",
  appId: "1:533891626769:web:d1cd9e6d26db180a87beb0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
