import React, { ReactNode } from 'react';
import { AuthProvider } from '../lib/firebase/hooks';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Main application provider that wraps all other providers
 * Currently includes:
 * - AuthProvider for Firebase authentication
 */
const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AppProvider; 