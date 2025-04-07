/**
 * Helper module to load icon fonts for web platform
 */
import { Platform } from 'react-native';

/**
 * Loads the Ionicons font for web platform by injecting
 * the necessary @font-face CSS into the document head
 */
export const loadWebIconFonts = async (): Promise<void> => {
  if (Platform.OS !== 'web') return;
  
  try {
    // Define the @font-face for Ionicons
    const iconFontStyles = `@font-face {
      font-family: 'Ionicons';
      src: url(${require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }`;
    
    // Create and append the style tag
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(iconFontStyles));
    document.head.appendChild(style);
    
    console.log('Successfully loaded Ionicons font for web');
  } catch (error) {
    console.error('Failed to load Ionicons font for web:', error);
  }
}; 