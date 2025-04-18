import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase.config';
import { getUserById } from '../db/repositories/userRepository';
import { User } from '../db/types';
import { Role } from '../db/types';

// Define known admin email
const ADMIN_EMAIL = 'engribitoye@gmail.com';

// Authentication context
interface AuthContextProps {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextProps>({
  firebaseUser: null,
  user: null,
  loading: true,
  error: null
});

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authUser) => {
        console.log(`AuthProvider: Auth state changed - User ${authUser ? `logged in: ${authUser.uid}` : 'logged out'}`);
        setLoading(true);
        try {
          if (authUser) {
            console.log(`AuthProvider: Setting Firebase user in state`);
            setFirebaseUser(authUser);
            
            // Get the user data from Firestore
            console.log(`AuthProvider: Fetching user data from Firestore for UID: ${authUser.uid}`);
            let userData: User | null = null;
            
            try {
              userData = await getUserById(authUser.uid);
              
              if (userData) {
                console.log(`AuthProvider: User data fetched successfully. Role: ${userData.role}, Type: ${typeof userData.role}`);
                console.log(`AuthProvider: Role comparison - CLIENT: ${userData.role === Role.CLIENT}, EXPERT: ${userData.role === Role.EXPERT}, ADMIN: ${userData.role === Role.ADMIN}`);
                console.log(`AuthProvider: Case-insensitive role check - CLIENT: ${String(userData.role).toUpperCase() === Role.CLIENT}, EXPERT: ${String(userData.role).toUpperCase() === Role.EXPERT}, ADMIN: ${String(userData.role).toUpperCase() === Role.ADMIN}`);
              } else {
                console.warn(`AuthProvider: No user data found in Firestore for UID: ${authUser.uid}, creating fallback user data`);
              }
            } catch (firebaseError) {
              console.error(`AuthProvider: Error fetching user data from Firestore:`, firebaseError);
              console.warn(`AuthProvider: Will use fallback user data`);
            }
            
            // If we couldn't get the user data from Firestore, create a fallback user object
            // This ensures the app can still function even if Firestore access is blocked
            if (!userData) {
              console.log(`AuthProvider: Creating fallback user object from auth data`);
              
              // Determine the role based on email
              // If this is our known admin email, set role to ADMIN
              const userRole = authUser.email === ADMIN_EMAIL ? Role.ADMIN : Role.CLIENT;
              
              // Create a basic user object from the auth user
              const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
              userData = {
                id: authUser.uid,
                email: authUser.email || '',
                name: authUser.displayName || `User-${authUser.uid.substring(0, 5)}`,
                role: userRole,
                createdAt: now,
                updatedAt: now
              };
              
              console.log(`AuthProvider: Created fallback user data:`, JSON.stringify(userData));
            }
            
            // Set the user data in state
            setUser(userData);
          } else {
            console.log(`AuthProvider: Clearing user state on logout`);
            setFirebaseUser(null);
            setUser(null);
          }
        } catch (err) {
          console.error('AuthProvider: Error in auth state change handler:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
          console.log(`AuthProvider: Finished processing auth state change. Loading: false`);
          setLoading(false);
        }
      },
      (err) => {
        console.error('AuthProvider: Auth state change error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log(`useAuth hook called - User: ${context.user?.id || 'none'}, Loading: ${context.loading}`);
  return context;
};

// Custom hook to get the current user
export const useCurrentUser = () => {
  const { user, loading, error } = useAuth();
  console.log(`useCurrentUser hook called - User: ${user?.id || 'none'}, Loading: ${loading}`);
  return { user, loading, error };
};

// Custom hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  console.log(`useIsAuthenticated hook called - IsAuthenticated: ${isAuthenticated}, Loading: ${loading}`);
  return { isAuthenticated, loading };
};

// Custom hook to check if user has a specific role
export const useHasRole = (role: string) => {
  const { user, loading } = useAuth();
  
  // Convert both roles to uppercase for case-insensitive comparison
  const userRoleUpper = user?.role ? String(user.role).toUpperCase() : '';
  const requestedRoleUpper = role.toUpperCase();
  
  const hasRole = userRoleUpper === requestedRoleUpper;
  
  console.log(`useHasRole hook called - Role requested: ${role}, User role: ${user?.role}, Has role: ${hasRole}, Loading: ${loading}`);
  return { hasRole, loading };
}; 