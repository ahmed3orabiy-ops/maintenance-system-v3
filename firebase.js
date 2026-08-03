import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE5GZAJOaHdSIFC9udxENcHe_EMjjYqV0",
  authDomain: "el-rabeh.firebaseapp.com",
  projectId: "el-rabeh",
  storageBucket: "el-rabeh.firebasestorage.app",
  messagingSenderId: "1073491754502",
  appId: "1:1073491754502:web:2951c9f74a01a68acfcd87",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
