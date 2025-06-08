// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace the values below with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAo_hVJG4l9pv_dNRbJ6IAe9fUohxCNw30",
  authDomain: "emergency-weather-app-461508.firebaseapp.com",
  projectId: "emergency-weather-app-461508",
  storageBucket: "emergency-weather-app-461508.firebasestorage.app",
  messagingSenderId: "934774214752",
  appId: "934774214752:web:fd284e7decc3d12ab73305"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export const functions = getFunctions(app);



export { auth, provider ,db  };
