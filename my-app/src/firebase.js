import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDwL-n1x-6gs6Wy_rJ1UbKdi4ukrOheLL4",
  authDomain: "egypthire-d9e0e.firebaseapp.com",
  projectId: "egypthire-d9e0e",
  storageBucket: "egypthire-d9e0e.appspot.com",
  messagingSenderId: "877480484065",
  appId: "1:877480484065:web:7f4b1f019ba0ea77f9aba0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// هذا السطر هو المسؤول عن تسريع الموقع وحفظ البيانات على الجهاز
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const storage = getStorage(app);