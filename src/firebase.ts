// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcjxCEN7CSL39vBR1BwAV9dwkjcBQrB-s",
  authDomain: "pic-art-126c7.firebaseapp.com",
  projectId: "pic-art-126c7",
  storageBucket: "pic-art-126c7.firebasestorage.app",
  messagingSenderId: "167406345851",
  appId: "1:167406345851:web:6cda069064ddaa9002ccde",
  measurementId: "G-ZBYXM99NQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
