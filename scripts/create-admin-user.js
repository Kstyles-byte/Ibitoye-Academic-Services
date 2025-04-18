/**
 * Script to create a new admin user directly from the client-side Firebase SDK
 * 
 * Usage:
 * 1. Run: node scripts/create-admin-user.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Your Firebase configuration from the app
const firebaseConfig = {
  apiKey: "AIzaSyCmNn9PgxphgJKi1H4-vxnSKbRZDMQqhcs",
  authDomain: "ebitoye-acad.firebaseapp.com",
  projectId: "ebitoye-acad",
  storageBucket: "ebitoye-acad.firebasestorage.app",
  messagingSenderId: "91564213106",
  appId: "1:91564213106:web:ee167b89da1f5512f813eb"
};

// User credentials
const email = 'engribitoye@gmail.com';
const password = 'excel777';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log(`Attempting to create admin user with email: ${email}`);
    
    // Try to create a new user
    let userCredential;
    
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`Created new user with UID: ${userCredential.user.uid}`);
    } catch (error) {
      // Handle errors
      if (error.code === 'auth/email-already-in-use') {
        console.log('User already exists, logging in...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(`Logged in as existing user with UID: ${userCredential.user.uid}`);
      } else {
        throw error;
      }
    }
    
    // Create or update the user document in Firestore
    const userRef = doc(db, 'users', userCredential.user.uid);
    
    // Set user data with admin role
    await setDoc(userRef, {
      id: userCredential.user.uid,
      email: email,
      name: 'Admin User',
      role: 'ADMIN', // Set as admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true }); // Use merge to update if exists
    
    console.log(`Successfully set up admin user with email: ${email}`);
    console.log(`You can now log in with these credentials`);
    
    // Sign out
    await auth.signOut();
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 