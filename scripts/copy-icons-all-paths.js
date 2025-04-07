const fs = require('fs');
const path = require('path');

/**
 * This script copies the Ionicons font file to multiple locations 
 * to ensure it's accessible in the deployed environment
 */
async function copyIoniconsToAllPaths() {
  console.log('Starting Ionicons font copy process...');
  
  try {
    // Source path for Ionicons font in node_modules
    const sourceFont = path.resolve(
      __dirname, 
      '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
    );
    
    if (!fs.existsSync(sourceFont)) {
      console.error('Source font not found:', sourceFont);
      process.exit(1);
    }
    
    console.log('Source font found:', sourceFont);
    
    // Define all possible target directories
    const targetDirs = [
      // Vercel static files location
      path.resolve(__dirname, '../dist/static/media'),
      // Next.js static files location
      path.resolve(__dirname, '../dist/_next/static/media'),
      // Traditional web static files location
      path.resolve(__dirname, '../dist/assets/fonts'),
      // Expo Web output location
      path.resolve(__dirname, '../dist/_expo/static/media'),
      // Another possible Next.js location
      path.resolve(__dirname, '../.next/static/media'),
      // Public directory
      path.resolve(__dirname, '../dist/public/fonts')
    ];
    
    for (const dir of targetDirs) {
      try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
          console.log(`Creating directory: ${dir}`);
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Target path for the font file
        const targetFont = path.resolve(dir, 'Ionicons.ttf');
        
        // Copy the font file
        fs.copyFileSync(sourceFont, targetFont);
        console.log(`Successfully copied Ionicons font to ${targetFont}`);
      } catch (error) {
        console.error(`Error copying to ${dir}:`, error.message);
        // Continue with other directories
      }
    }
    
    console.log('Font copy process complete!');
  } catch (error) {
    console.error('Error in copy process:', error);
    process.exit(1);
  }
}

// Run the function
copyIoniconsToAllPaths(); 