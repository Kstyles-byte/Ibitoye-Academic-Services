import React, { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from '../lib/firebase/hooks';
import { loadWebIconFonts } from '../lib/web/iconFonts';
import { loadIoniconsFallback } from '../lib/web/ioniconsWebFallback';
import { loadInlineIonicons } from '../lib/web/inlineIonicons';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Icon provider component to ensure icons load properly
 * Uses multiple fallback mechanisms to guarantee icon loading
 */
const IconProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Only run on web platform
    if (Platform.OS === 'web') {
      // Try all loading methods with delays and fallbacks
      
      // First try local loading
      loadWebIconFonts().catch(error => {
        console.warn('Failed to load icon fonts locally:', error);
      });
      
      // After a short delay, try the CDN fallback
      const cdnTimer = setTimeout(() => {
        loadIoniconsFallback();
      }, 2000);
      
      // After a longer delay, try the inline base64 method as last resort
      const inlineTimer = setTimeout(() => {
        loadInlineIonicons();
      }, 3500);
      
      return () => {
        clearTimeout(cdnTimer);
        clearTimeout(inlineTimer);
      };
    }
  }, []);

  return <>{children}</>;
};

/**
 * Main application provider that wraps all other providers
 * Currently includes:
 * - AuthProvider for Firebase authentication
 * - IconProvider for proper icon loading
 */
const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <AuthProvider>
      <IconProvider>
        {children}
      </IconProvider>
    </AuthProvider>
  );
};

export default AppProvider; 