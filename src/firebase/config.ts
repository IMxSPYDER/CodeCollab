import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjy-ya9LjscxfRtTV0M3NYBqGL2I8_biU",
  authDomain: "codecollab-fd790.firebaseapp.com",
  projectId: "codecollab-fd790",
  storageBucket: "codecollab-fd790.firebasestorage.app",
  messagingSenderId: "186187196987",
  appId: "1:186187196987:web:a5ca3c09c111df97ad4a1e",
  measurementId: "G-9XLEL0F3VQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;