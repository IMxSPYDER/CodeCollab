import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCezci2FOrc85WK-antS3aHmn7kl8imInc",
  authDomain: "codecollab-7fb4b.firebaseapp.com",
  projectId: "codecollab-7fb4b",
  storageBucket: "codecollab-7fb4b.firebasestorage.app",
  messagingSenderId: "572910822995",
  appId: "1:572910822995:web:b984ccb2a1c9416b2948a6",
  measurementId: "G-SL2PHFQ3XB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
