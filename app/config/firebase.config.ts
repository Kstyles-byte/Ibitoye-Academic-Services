// Firebase configuration
// Using real Firebase authentication and Firestore database
// But using local storage instead of Firebase Storage

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmNn9PgxphgJKi1H4-vxnSKbRZDMQqhcs",
  authDomain: "ebitoye-acad.firebaseapp.com",
  projectId: "ebitoye-acad",
  storageBucket: "ebitoye-acad.firebasestorage.app",
  messagingSenderId: "91564213106",
  appId: "1:91564213106:web:ee167b89da1f5512f813eb"
};

// Initialize Firebase if it hasn't been initialized already
console.log('Initializing Firebase...');
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
console.log(`Firebase initialized with projectId: ${firebaseConfig.projectId}`);

console.log('Initializing Firebase Auth...');
const auth = getAuth(app);
console.log('Firebase Auth initialized');

console.log('Initializing Firestore...');
const db = getFirestore(app);
console.log('Firestore initialized');

// Check if we're in development mode (could be determined by environment variables)
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment && process.env.USE_FIRESTORE_EMULATOR) {
  console.log('Connecting to Firestore emulator...');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Connected to Firestore emulator');
}

export { app, auth, db }; 