import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwL-n1x-6gs6Wy_rJ1UbKdi4ukrOheLL4",
  authDomain: "egypthire-d9e0e.firebaseapp.com",
  projectId: "egypthire-d9e0e",
  storageBucket: "egypthire-d9e0e.firebasestorage.app",
  messagingSenderId: "877480484065",
  appId: "1:877480484065:web:7f4b1f019ba0ea77f9aba0"
};

const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);