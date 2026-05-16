import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATmOE3778FcN0mMGYVo-ReQYXlKtW6Yak",
  authDomain: "the-collective-savers-full-mvp.firebaseapp.com",
  projectId: "the-collective-savers-full-mvp",
  storageBucket: "the-collective-savers-full-mvp.firebasestorage.app",
  messagingSenderId: "63446592652",
  appId: "1:63446592652:web:9dfeec6d0be28ed9b95fa9",
  measurementId: "G-D6672YFS6J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
