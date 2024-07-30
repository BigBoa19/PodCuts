import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAi4f_qSjtQL3lZVi-hrTj1tQNcbRs_FN4",
  authDomain: "podcuts-e86ac.firebaseapp.com",
  projectId: "podcuts-e86ac",
  storageBucket: "podcuts-e86ac.appspot.com",
  messagingSenderId: "692607574102",
  appId: "1:692607574102:web:847d41184c3909575b1bf7",
  measurementId: "G-6WQX5P2NY0",
  storageBucket: "gs://podcuts-e86ac.appspot.com"
};

const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);