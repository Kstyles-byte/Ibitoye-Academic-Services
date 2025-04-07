import { createElement } from 'react';
import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';

// Import the root component - use the correct path for the Expo router entry
// Try different import paths to handle various build configurations
let App;
try {
  // First try the path for production builds
  App = require('../../node_modules/expo-router/entry').default;
} catch (error) {
  try {
    // Then try the development path
    App = require('expo-router/entry').default;
  } catch (innerError) {
    console.error('Failed to import App component:', innerError);
    // Provide a fallback component if all imports fail
    App = () => createElement('div', null, 'Failed to load application');
  }
}

// Create a function to load Ionicons resources
const loadIconResources = () => {
  return new Promise((resolve) => {
    try {
      // First check if Ionicons is already loaded
      if (document.querySelector('link[href*="ionicons"]') && 
          document.querySelector('script[src*="ionicons"]')) {
        console.log('Ionicons already loaded');
        resolve();
        return;
      }

      // Import the Ionicons web css
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/ionicons@5.5.2/dist/css/ionicons.min.css';
      document.head.appendChild(link);

      // Import the Ionicons Module
      const scriptModule = document.createElement('script');
      scriptModule.type = 'module';
      scriptModule.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js';
      document.head.appendChild(scriptModule);

      // Import the Ionicons for non-module browsers
      const scriptNoModule = document.createElement('script');
      scriptNoModule.noModule = true;
      scriptNoModule.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js';
      document.head.appendChild(scriptNoModule);

      // Set a timeout to resolve the promise even if scripts don't fire onload
      const timeoutId = setTimeout(() => {
        console.warn('Ionicons load timeout - continuing anyway');
        resolve();
      }, 3000);

      // Resolve when the script loads
      scriptModule.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      // Also handle error case
      scriptModule.onerror = () => {
        console.warn('Error loading Ionicons - falling back to Font Awesome');
        clearTimeout(timeoutId);
        
        // Load Font Awesome as fallback
        const fallbackLink = document.createElement('link');
        fallbackLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        fallbackLink.rel = 'stylesheet';
        document.head.appendChild(fallbackLink);
        
        resolve();
      };
    } catch (error) {
      console.error('Error loading icon resources:', error);
      resolve(); // Always resolve to continue app initialization
    }
  });
};

// Check browser compatibility
const checkBrowserCompatibility = () => {
  // Add Font Awesome for older browsers that might not support custom elements
  if (!window.customElements) {
    console.warn('Browser does not support custom elements - using Font Awesome fallback');
    const fallbackLink = document.createElement('link');
    fallbackLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    fallbackLink.rel = 'stylesheet';
    document.head.appendChild(fallbackLink);
  }
};

// Initialize the app
const initApp = async () => {
  try {
    // Check browser compatibility
    checkBrowserCompatibility();
    
    // Load icon resources first
    await loadIconResources();
    
    // Load custom styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = './style.css';
    document.head.appendChild(styleLink);

    // Register and start the app
    if (module.hot) {
      // For hot reloading during development
      AppRegistry.registerComponent('main', () => App);
      AppRegistry.runApplication('main', {
        initialProps: {},
        rootTag: document.getElementById('root'),
      });
    } else {
      // For production
      registerRootComponent(App);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    
    // Show error message to user if app fails to initialize
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h2>Application Error</h2>
          <p>The application failed to initialize. Please try refreshing the page.</p>
          <button onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }
};

// Start the app initialization
initApp(); 