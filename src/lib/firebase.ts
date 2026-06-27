import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBzlCU4UK82uaOVggVFG48Q0UZYW_Oa2E",
  authDomain: "studio-2297115675-94c57.firebaseapp.com",
  projectId: "studio-2297115675-94c57",
  storageBucket: "studio-2297115675-94c57.firebasestorage.app",
  messagingSenderId: "807969790901",
  appId: "1:807969790901:web:ce9349abce3e3c2f12d7fc"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Secondary app used ONLY for creating student accounts via Admin Panel
// so the Admin doesn't get logged out
const secondaryApp = getApps().find(a => a.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

export default app;
