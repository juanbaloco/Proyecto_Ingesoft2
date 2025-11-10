import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMEnXWzMZCv32Tckh1ORLCa8rIWP4qWYY",
  authDomain: "ingsoft2-3e146.firebaseapp.com",
  projectId: "ingsoft2-3e146",
  storageBucket: "ingsoft2-3e146.firebasestorage.app",
  messagingSenderId: "137118794377",
  appId: "1:137118794377:web:a6db90980ff50eaa093c58",
  measurementId: "G-87C8C5D6PV"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

export {app, auth, db}