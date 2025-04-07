const fs = require('fs');
const path = require('path');

/**
 * Copy Ionicons font to the public folder for direct access
 */
async function setupPublicIcons() {
  console.log('Setting up public icons...');
  
  try {
    // Source path for Ionicons font
    const sourceFont = path.resolve(
      __dirname, 
      '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
    );
    
    // Ensure public directory exists
    const publicDir = path.resolve(__dirname, '../assets/fonts');
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy to public directory
    const targetFont = path.resolve(publicDir, 'Ionicons.ttf');
    fs.copyFileSync(sourceFont, targetFont);
    console.log(`Copied Ionicons font to ${targetFont}`);
    
    // Create CSS file for loading the font
    const cssContent = `
      /* Ionicons font-face definition */
      @font-face {
        font-family: 'Ionicons';
        src: url('/assets/fonts/Ionicons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    `;
    
    const cssFilePath = path.resolve(publicDir, '../web/ionicons.css');
    
    // Ensure directory exists
    const cssDir = path.dirname(cssFilePath);
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    // Write CSS file
    fs.writeFileSync(cssFilePath, cssContent);
    console.log(`Created CSS file at ${cssFilePath}`);
    
    console.log('Public icons setup complete!');
  } catch (error) {
    console.error('Error setting up public icons:', error);
    process.exit(1);
  }
}

// Run the function
setupPublicIcons(); 