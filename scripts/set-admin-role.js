/**
 * Script to set a user's role to ADMIN
 * 
 * Usage:
 * 1. Make sure you have Firebase Admin SDK set up
 * 2. Run: node scripts/set-admin-role.js <user_email>
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// You'll need to create a service account key and place it in this location
const serviceAccount = require('../service-account-key.json');

// Initialize the app with a service account
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();

async function setUserAsAdmin(email) {
  if (!email) {
    console.error('Please provide a user email');
    process.exit(1);
  }

  try {
    // Get user by email from Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`Found user: ${userData.name || userData.email} (${userDoc.id})`);
    console.log(`Current role: ${userData.role}`);
    
    // Update user role to ADMIN
    await db.collection('users').doc(userDoc.id).update({
      role: 'ADMIN',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Successfully updated user ${email} role to ADMIN`);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
setUserAsAdmin(userEmail); 