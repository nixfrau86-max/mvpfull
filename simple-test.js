import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

async function testWrite() {
  try {
    const docRef = await addDoc(collection(db, "test_collection"), {
      test: "data",
      timestamp: new Date().toISOString()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

testWrite();
