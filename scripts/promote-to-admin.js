/**
 * Script to create or promote a user to admin role
 * 
 * Usage:
 * 1. Make sure you have Firebase Admin SDK set up
 * 2. Run: node scripts/promote-to-admin.js
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// You'll need to create a service account key and place it in this location
const serviceAccount = require('../service-account-key.json');

// Initialize the app with a service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();
const auth = getAuth();

// User credentials
const email = 'engribitoye@gmail.com';
const password = 'excel777';

async function createOrPromoteAdmin() {
  try {
    console.log(`Checking if user exists with email: ${email}`);
    
    // First check if the user exists in Firebase Auth
    let uid;
    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`User already exists in Firebase Auth with UID: ${uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User does not exist, creating new user with email: ${email}`);
        const newUser = await auth.createUser({
          email: email,
          password: password,
          displayName: 'Admin User',
        });
        uid = newUser.uid;
        console.log(`Created new user with UID: ${uid}`);
      } else {
        throw error;
      }
    }
    
    // Now check if user exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      console.log(`User document exists in Firestore. Current role: ${userDoc.data().role}`);
      
      // Update the role to ADMIN
      await db.collection('users').doc(uid).update({
        role: 'ADMIN',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Successfully updated user to ADMIN role`);
    } else {
      console.log(`User document does not exist in Firestore, creating new document`);
      
      // Create a new user document
      const now = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('users').doc(uid).set({
        id: uid,
        email: email,
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`Successfully created new ADMIN user document in Firestore`);
    }
    
    console.log(`Admin user setup complete for ${email}`);
    console.log(`You can now log in with these credentials`);
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

createOrPromoteAdmin(); 