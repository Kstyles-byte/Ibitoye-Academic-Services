const fs = require('fs');
const path = require('path');

/**
 * This script copies the Ionicons font from node_modules to the correct 
 * location in the Vercel build output directory
 */
async function copyIoniconsFont() {
  console.log('Starting font copy process...');
  
  try {
    // Source path for Ionicons font in node_modules
    const sourceFont = path.resolve(
      __dirname, 
      '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
    );
    
    // Target directory in the build output
    const targetDir = path.resolve(__dirname, '../dist/_next/static/media');
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      console.log(`Creating directory: ${targetDir}`);
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Target path for the font file
    const targetFont = path.resolve(targetDir, 'Ionicons.ttf');
    
    // Copy the font file
    fs.copyFileSync(sourceFont, targetFont);
    console.log(`Successfully copied Ionicons font to ${targetFont}`);
  } catch (error) {
    console.error('Error copying Ionicons font:', error);
    process.exit(1);
  }
}

// Run the function
copyIoniconsFont(); 