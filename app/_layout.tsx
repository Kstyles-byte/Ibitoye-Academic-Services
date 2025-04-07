import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import AppProvider from '@/app/providers/AppProvider';
import { initializeStorage } from '@/app/lib/storage/storageInit';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add web-specific debugging
if (Platform.OS === 'web') {
  console.log('[APP] Running on web platform');
  
  // Add debugging information to window for easier access
  if (typeof window !== 'undefined') {
    // @ts-ignore - Debugging utility
    window.DEBUG = {
      logIconInfo: () => {
        const icons = document.querySelectorAll('[data-lucide]');
        console.log(`[DEBUG] Found ${icons.length} Lucide icon elements in DOM`);
        
        icons.forEach((icon, i) => {
          console.log(`[DEBUG] Icon ${i + 1}:`, {
            element: icon,
            name: icon.getAttribute('data-lucide'),
            isVisible: window.getComputedStyle(icon).display !== 'none',
            dimensions: {
              width: icon.clientWidth,
              height: icon.clientHeight
            },
            parent: icon.parentElement
          });
        });
        
        return `Found ${icons.length} icons`;
      },
      fixIcons: () => {
        try {
          console.log('[DEBUG] Attempting to manually fix icons');
          // @ts-ignore - Access lucide global
          if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            // @ts-ignore - Call lucide global
            lucide.createIcons();
            return 'Icons recreated successfully';
          } else {
            console.error('[DEBUG] Lucide library not found in global scope');
            return 'Error: Lucide library not found';
          }
        } catch (e) {
          console.error('[DEBUG] Error fixing icons:', e);
          return `Error: ${e.message}`;
        }
      }
    };
    
    console.log('[APP] Debug utilities attached to window.DEBUG');
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Log platform info
        console.log(`[APP] Initializing app on ${Platform.OS} platform`);
        
        // Initialize local storage
        await initializeStorage();
        
        // Hide splash screen if fonts are loaded
        if (loaded) {
          await SplashScreen.hideAsync();
          console.log('[APP] Splash screen hidden, app ready');
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        
        // Attempt to continue on web platform with storage errors
        if (Platform.OS === 'web' && loaded) {
          console.warn('[APP] Continuing on web platform despite initialization error');
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
          <Stack.Screen name="(expert)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
