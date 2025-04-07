/**
 * Script to test Firestore document creation directly
 * 
 * Usage:
 * 1. Run: node scripts/test-firestore.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  collection,
  getDocs,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase configuration from the app
const firebaseConfig = {
  apiKey: "AIzaSyCmNn9PgxphgJKi1H4-vxnSKbRZDMQqhcs",
  authDomain: "ebitoye-acad.firebaseapp.com",
  projectId: "ebitoye-acad",
  storageBucket: "ebitoye-acad.firebasestorage.app",
  messagingSenderId: "91564213106",
  appId: "1:91564213106:web:ee167b89da1f5512f813eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('Starting Firestore test...');
    
    // First test: List all users in Firestore
    console.log('Test 1: Listing users collection');
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      console.log(`Found ${userDocs.size} users in Firestore`);
      
      if (userDocs.size > 0) {
        console.log('First few user documents:');
        let count = 0;
        userDocs.forEach(doc => {
          if (count < 3) {
            console.log(`User ID: ${doc.id}, Data:`, doc.data());
            count++;
          }
        });
      }
    } catch (error) {
      console.error('Error listing users:', error);
    }
    
    // Second test: Create a test document
    console.log('\nTest 2: Creating a test document');
    try {
      const testDocId = 'test-' + Date.now();
      const testDocRef = doc(db, 'test-documents', testDocId);
      
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log(`Creating test document with ID: ${testDocId}`);
      await setDoc(testDocRef, testData);
      console.log('Test document created successfully!');
    } catch (error) {
      console.error('Error creating test document:', error);
      if (error.message) {
        console.error('Error message:', error.message);
      }
    }
    
    console.log('\nFirestore test completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testFirestore(); 