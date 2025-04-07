import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase.config';
import { createDocumentWithId } from '../db/firestore';
import { Role, User } from '../db/types';

// Register a new user
export const registerUser = async (
  email: string, 
  password: string, 
  name?: string,
  role: Role = Role.CLIENT
): Promise<User> => {
  try {
    console.log(`Attempting to register user with email: ${email}, name: ${name}, role: ${role}`);
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    console.log(`Firebase Auth user created with UID: ${user.uid}`);

    // Update profile with name
    if (name) {
      console.log(`Updating profile with displayName: ${name}`);
      await updateProfile(user, { displayName: name });
    }

    // Create user record in Firestore
    // Based on the test script results, we should use a consistent field name structure
    // Some existing documents use 'displayName' instead of 'name' and lowercase for 'role'
    const userData: any = {
      email: user.email || email,
      displayName: name || user.displayName || '',  // Changed from 'name' to match existing docs
      role: role.toLowerCase(),  // Convert to lowercase to match existing docs
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Only add emailVerified if it's true
    if (user.emailVerified) {
      userData.emailVerified = serverTimestamp();
    }
    
    console.log(`Creating Firestore user document with data:`, JSON.stringify(userData));
    console.log(`Target Firestore collection: users, document ID: ${user.uid}`);

    try {
      // Create user document directly with setDoc instead of going through our createDocumentWithId helper
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, userData);
      
      console.log(`User successfully registered and stored in Firestore with ID: ${user.uid}`);
      
      // Return a properly formatted user object as expected by our application
      return { 
        id: user.uid,
        name: name || user.displayName || '',  // Keep 'name' in our returned object for app consistency
        email: user.email || email,
        role: role,  // Use the enum value for our application
        createdAt: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        },
        updatedAt: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        }
      };
    } catch (firestoreError) {
      console.error('Error creating user document in Firestore:', firestoreError);
      
      // Log more details about the error
      if (firestoreError instanceof Error) {
        console.error('Error details:', firestoreError.message);
        console.error('Error stack:', firestoreError.stack);
        
        // Check for specific error types
        if (firestoreError.message.includes('permission-denied')) {
          console.error('This appears to be a Firebase permission error. Check your security rules.');
        } else if (firestoreError.message.includes('INVALID_ARGUMENT')) {
          console.error('This appears to be an invalid data format error.');
        }
      }
      
      // If we fail to create the Firestore document, still return a user object so the auth flow can continue
      const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
      const fallbackUser: User = {
        id: user.uid,
        email: user.email || email,
        name: name || user.displayName || '',
        role: role,  // Use the enum value for our application
        createdAt: now,
        updatedAt: now
      };
      
      // Rethrow the error so the caller knows something went wrong
      throw firestoreError;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Register an admin user (this should only be used in development)
export const registerAdminUser = async (
  email: string,
  password: string,
  name: string = 'Admin User'
): Promise<User> => {
  try {
    console.log(`Attempting to register admin user with email: ${email}`);
    return await registerUser(email, password, name, Role.ADMIN);
  } catch (error) {
    console.error('Error registering admin user:', error);
    throw error;
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    console.log(`Attempting to sign in user with email: ${email}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log(`User signed in successfully. UID: ${userCredential.user.uid}`);
    console.log(`User role will be fetched from Firestore by the auth state listener`);
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    console.log('Attempting to sign out user');
    
    await firebaseSignOut(auth);
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  const currentUser = auth.currentUser;
  console.log(`Current user: ${currentUser ? currentUser.uid : 'No user signed in'}`);
  return currentUser;
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    console.log(`Attempting to send password reset email to: ${email}`);
    
    await sendPasswordResetEmail(auth, email);
    
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Update user email
export const updateUserEmail = async (email: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is signed in');
    
    console.log(`Attempting to update email for user ${user.uid} to: ${email}`);
    
    await updateEmail(user, email);
    
    console.log('Email updated successfully');
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is signed in');
    
    console.log(`Attempting to update password for user ${user.uid}`);
    
    await updatePassword(user, password);
    
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  console.log('Setting up auth state change listener');
  
  return onAuthStateChanged(auth, (user) => {
    console.log(`Auth state changed: User ${user ? user.uid : 'signed out'}`);
    callback(user);
  });
}; 