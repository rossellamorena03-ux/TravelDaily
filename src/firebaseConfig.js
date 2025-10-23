import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAz6FVeNpnq2TdyUxHwnr3xrKxTUmIXWpY",
  authDomain: "viaggia-ancora.appspot.com",
  projectId: "viaggia-ancora",
  storageBucket: "viaggia-ancora.firebasestorage.app",
  messagingSenderId: "250765926405",
  appId: "1:250765926405:web:facb3fc2145526008cbc6c"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);
export const auth = getAuth(app);
export { db, messaging, onMessage, app };