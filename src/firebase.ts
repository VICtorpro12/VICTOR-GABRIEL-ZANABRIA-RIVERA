import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2knVjvQXgU7QQrqnsxiKcVLCACCAuvLo",
  authDomain: "prep-udg.firebaseapp.com",
  projectId: "prep-udg",
  storageBucket: "prep-udg.firebasestorage.app",
  messagingSenderId: "267487282028",
  appId: "1:267487282028:web:fcb7653346d91e08c32949",
  measurementId: "G-86VNC7SRQK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
