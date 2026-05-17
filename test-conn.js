import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATmOE3778FcN0mMGYVo-ReQYXlKtW6Yak",
  authDomain: "the-collective-savers-full-mvp.firebaseapp.com",
  projectId: "the-collective-savers-full-mvp",
  storageBucket: "the-collective-savers-full-mvp.firebasestorage.app",
  messagingSenderId: "63446592652",
  appId: "1:63446592652:web:9dfeec6d0be28ed9b95fa9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const test = async () => {
  try {
    console.log("Testing connection...");
    const querySnapshot = await getDocs(collection(db, "waves"));
    console.log("Docs found:", querySnapshot.size);
  } catch (e) {
    console.error("Connection error:", e);
  }
};

test();
