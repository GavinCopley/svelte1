// Import only the necessary Firestore functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOC4YglYdxBjw3XyYLFIm7tYoBoJNgu28",
  authDomain: "wise-owl-c57ba.firebaseapp.com",
  projectId: "wise-owl-c57ba",
  storageBucket: "wise-owl-c57ba.firebasestorage.app",
  messagingSenderId: "393646585736",
  appId: "1:393646585736:web:30a5a47abe278b4830ec3d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export only Firestore
export const db = getFirestore(app);
