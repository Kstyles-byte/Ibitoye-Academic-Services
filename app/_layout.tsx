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
import { initializeStorage } from '@/app/lib/cloudinary';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
