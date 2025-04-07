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
    // Try multiple paths to maximize compatibility
    const fontPaths = [
      require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
      '/static/media/Ionicons.ttf',
      '/_next/static/media/Ionicons.ttf',
      '/assets/fonts/Ionicons.ttf'
    ];

    // Create multiple @font-face declarations with different paths for redundancy
    const iconFontStyles = fontPaths.map(path => `
      @font-face {
        font-family: 'Ionicons';
        src: url(${typeof path === 'string' ? path : path}) format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    `).join('\n');
    
    // Create and append the style tag
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(iconFontStyles));
    document.head.appendChild(style);

    // Also create a link preload element for the font
    fontPaths.forEach(path => {
      if (typeof path === 'string') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = path;
        link.as = 'font';
        link.type = 'font/ttf';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
    
    console.log('Successfully loaded Ionicons font for web');
  } catch (error) {
    console.error('Failed to load Ionicons font for web:', error);
  }
}; 