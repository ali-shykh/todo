// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvZo40IPisnsHMvyZ9yKgZ0JsDjPpcwaw",
  authDomain: "todo-app-6269a.firebaseapp.com",
  projectId: "todo-app-6269a",
  storageBucket: "todo-app-6269a.appspot.com",
  messagingSenderId: "813261715649",
  appId: "1:813261715649:web:d35157ddc2313af9037c40",
  measurementId: "G-Q588QBKSW1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, GoogleAuthProvider, signInWithPopup, signOut, db }; // Export the necessary functions and objects
