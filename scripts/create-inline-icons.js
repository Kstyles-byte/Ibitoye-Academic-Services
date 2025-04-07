const fs = require('fs');
const path = require('path');

/**
 * This script reads the Ionicons font and creates a file with the font
 * inlined as a base64 encoded string to ensure it's available
 */
async function createInlineIconsFile() {
  console.log('Creating inline icons file...');
  
  try {
    // Source path for Ionicons font
    const sourceFont = path.resolve(
      __dirname, 
      '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
    );
    
    // Read the font file
    const fontData = fs.readFileSync(sourceFont);
    
    // Convert to Base64
    const base64Font = fontData.toString('base64');
    
    // Create the output directory if it doesn't exist
    const outputDir = path.resolve(__dirname, '../app/lib/web');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create TypeScript file with inlined font
    const outputFile = path.resolve(outputDir, 'inlineIonicons.ts');
    const fileContent = `
/**
 * Inlined Ionicons font as base64
 * This is used as a last resort fallback if other loading methods fail
 */
import { Platform } from 'react-native';

// Base64 encoded Ionicons font
export const inlineIoniconsBase64 = '${base64Font}';

/**
 * Loads the Ionicons font directly from an inlined base64 string
 */
export const loadInlineIonicons = (): void => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  
  try {
    // Get base64 data URL
    const dataUrl = \`data:font/ttf;base64,\${inlineIoniconsBase64}\`;
    
    // Create style element with font-face definition
    const style = document.createElement('style');
    style.textContent = \`
      @font-face {
        font-family: 'Ionicons';
        src: url('\${dataUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    \`;
    
    // Add to document head
    document.head.appendChild(style);
    console.log('Successfully loaded inlined Ionicons font');
  } catch (error) {
    console.error('Failed to load inlined Ionicons font:', error);
  }
};
`;
    
    fs.writeFileSync(outputFile, fileContent);
    console.log(`Created inline icons file at ${outputFile}`);
  } catch (error) {
    console.error('Error creating inline icons file:', error);
    process.exit(1);
  }
}

// Run the function
createInlineIconsFile(); 