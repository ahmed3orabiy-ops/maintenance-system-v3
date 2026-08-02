// إعدادات الاتصال بـ Firebase
// هتلاقي القيم دي من صفحة إعدادات مشروعك على console.firebase.google.com
// (Project settings → عمومًا هتلاقيها تحت قسم "Your apps" بعد ما تضيف تطبيق ويب)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ضع_قيمتك_هنا",
  authDomain: "ضع_قيمتك_هنا",
  projectId: "ضع_قيمتك_هنا",
  storageBucket: "ضع_قيمتك_هنا",
  messagingSenderId: "ضع_قيمتك_هنا",
  appId: "ضع_قيمتك_هنا",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
