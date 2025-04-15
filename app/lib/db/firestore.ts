import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query as createQuery, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp as FirestoreTimestamp,
  addDoc,
  CollectionReference,
  DocumentData,
  Query,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import * as Types from './types';

// Generic function to convert Firestore timestamp to our Timestamp type
const convertTimestamp = (timestamp: FirestoreTimestamp): Types.Timestamp => {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds
  };
};

// Get document by ID
export const getDocumentById = async <T>(collectionName: string, id: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Get documents with query
export const getDocuments = async <T>(
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[] = [],
  sortField?: string,
  sortDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    let q: Query<DocumentData> = collectionRef;
    
    // Apply where conditions
    if (conditions.length > 0) {
      q = createQuery(collectionRef, ...conditions.map(c => where(c.field, c.operator, c.value)));
    }
    
    // Apply sorting
    if (sortField) {
      q = createQuery(q, orderBy(sortField, sortDirection));
    }
    
    // Apply limit
    if (limitCount) {
      q = createQuery(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

// Create a document with a specific ID
export const createDocumentWithId = async <T extends { id?: string }>(
  collectionName: string, 
  id: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> => {
  try {
    console.log(`Attempting to create document in ${collectionName} with ID: ${id}`);
    const docRef = doc(db, collectionName, id);
    
    const timestamp = serverTimestamp();
    const dataWithTimestamps = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    console.log(`Setting document data:`, JSON.stringify(dataWithTimestamps, (key, value) => 
      key === 'createdAt' || key === 'updatedAt' ? 'timestamp' : value
    ));
    
    await setDoc(docRef, dataWithTimestamps);
    console.log(`Document successfully created in ${collectionName} with ID: ${id}`);
    
    return { 
      id, 
      ...data, 
      createdAt: convertTimestamp(timestamp as FirestoreTimestamp),
      updatedAt: convertTimestamp(timestamp as FirestoreTimestamp)
    } as unknown as T;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    console.error(`Failed document ID: ${id}`);
    console.error(`Failed document data:`, JSON.stringify(data));
    
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    throw error;
  }
};

// Create a document with auto-generated ID
export const createDocument = async <T>(
  collectionName: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> => {
  try {
    const collectionRef = collection(db, collectionName);
    
    const timestamp = serverTimestamp();
    const dataWithTimestamps = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const docRef = await addDoc(collectionRef, dataWithTimestamps);
    
    return { 
      id: docRef.id, 
      ...data, 
      createdAt: convertTimestamp(timestamp as FirestoreTimestamp),
      updatedAt: convertTimestamp(timestamp as FirestoreTimestamp)
    } as unknown as T;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async <T>(
  collectionName: string, 
  id: string, 
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Subscribe to real-time updates for a collection
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  conditions: { field: string; operator: any; value: any }[] = [],
  sortField?: string,
  sortDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q: Query<DocumentData> = collectionRef;
    
    // Apply where conditions
    if (conditions.length > 0) {
      q = createQuery(collectionRef, ...conditions.map(c => where(c.field, c.operator, c.value)));
    }
    
    // Apply sorting
    if (sortField) {
      q = createQuery(q, orderBy(sortField, sortDirection));
    }
    
    // Apply limit
    if (limitCount) {
      q = createQuery(q, limit(limitCount));
    }
    
    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
    });
    
    // Return the unsubscribe function to be called when the component unmounts
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}; 