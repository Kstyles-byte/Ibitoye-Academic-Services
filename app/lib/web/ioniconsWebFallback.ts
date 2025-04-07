/**
 * Fallback mechanism to load Ionicons from CDN if local loading fails
 */
import { Platform } from 'react-native';

/**
 * Fallback to load Ionicons from CDN
 */
export const loadIoniconsFallback = (): void => {
  if (Platform.OS !== 'web') return;
  
  try {
    // If we're already in a web environment
    if (typeof document !== 'undefined') {
      // Check if Ionicons is already loaded
      const existingStylesheet = document.querySelector('link[href*="ionicons"]');
      if (existingStylesheet) {
        console.log('Ionicons already loaded via CDN, skipping fallback');
        return;
      }
      
      // Use CDN to load the CSS
      const cdnLink = document.createElement('link');
      cdnLink.rel = 'stylesheet';
      cdnLink.href = 'https://cdn.jsdelivr.net/npm/ionicons@5.5.1/dist/css/ionicons.min.css';
      cdnLink.crossOrigin = 'anonymous';
      document.head.appendChild(cdnLink);
      
      // Also add a backup CSS for the font directly from unpkg
      const ioniconsStyle = document.createElement('style');
      ioniconsStyle.textContent = `
        @font-face {
          font-family: 'Ionicons';
          src: url('https://unpkg.com/ionicons@5.5.1/dist/fonts/ionicons.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(ioniconsStyle);
      
      console.log('Loaded Ionicons from CDN as fallback');
    }
  } catch (error) {
    console.error('Failed to load Ionicons fallback:', error);
  }
}; 