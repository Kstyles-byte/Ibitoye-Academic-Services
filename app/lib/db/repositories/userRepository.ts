import { 
  getDocumentById, 
  getDocuments, 
  updateDocument, 
  deleteDocument 
} from '../firestore';
import { User, Client, Expert, Role } from '../types';
import { where } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const CLIENTS_COLLECTION = 'clients';
const EXPERTS_COLLECTION = 'experts';

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  return await getDocumentById<User>(USERS_COLLECTION, id);
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getDocuments<User>(
    USERS_COLLECTION,
    [{ field: 'email', operator: '==', value: email }],
    'createdAt',
    'desc',
    1
  );
  
  return users.length > 0 ? users[0] : null;
};

// Update user
export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  await updateDocument<User>(USERS_COLLECTION, id, data);
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  // First get the user to check their role
  const user = await getUserById(id);
  
  if (!user) throw new Error('User not found');
  
  // Delete related profiles
  if (user.role === Role.CLIENT) {
    // Get client profile
    const clients = await getDocuments<Client>(
      CLIENTS_COLLECTION,
      [{ field: 'userId', operator: '==', value: id }],
      undefined,
      'desc',
      1
    );
    
    if (clients.length > 0) {
      await deleteDocument(CLIENTS_COLLECTION, clients[0].id);
    }
  } else if (user.role === Role.EXPERT) {
    // Get expert profile
    const experts = await getDocuments<Expert>(
      EXPERTS_COLLECTION,
      [{ field: 'userId', operator: '==', value: id }],
      undefined,
      'desc',
      1
    );
    
    if (experts.length > 0) {
      await deleteDocument(EXPERTS_COLLECTION, experts[0].id);
    }
  }
  
  // Finally delete the user
  await deleteDocument(USERS_COLLECTION, id);
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  return await getDocuments<User>(USERS_COLLECTION);
};

// Get users by role
export const getUsersByRole = async (role: Role): Promise<User[]> => {
  return await getDocuments<User>(
    USERS_COLLECTION,
    [{ field: 'role', operator: '==', value: role }]
  );
}; 