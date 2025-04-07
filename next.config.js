const path = require('path');

module.exports = {
  // Enable static exports for Expo web
  output: 'export',
  
  // Configure webpack to properly handle fonts
  webpack: (config, { isServer, dev }) => {
    // Add loader for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]',
      },
    });

    // Add resolve alias for @expo/vector-icons
    config.resolve.alias = {
      ...config.resolve.alias,
      '@expo/vector-icons': path.resolve(__dirname, 'node_modules/@expo/vector-icons'),
    };

    // Add specific handling for Ionicons font
    if (!isServer) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyIonicons', () => {
            const fs = require('fs');
            const sourceFont = path.resolve(
              __dirname, 
              'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'
            );
            
            // Handle both dist and .next for different build processes
            const directories = [
              path.resolve(__dirname, 'dist/static/media'),
              path.resolve(__dirname, '.next/static/media')
            ];
            
            directories.forEach(dir => {
              if (!fs.existsSync(dir)) {
                try {
                  fs.mkdirSync(dir, { recursive: true });
                } catch (err) {
                  console.warn(`Could not create directory ${dir}:`, err);
                }
              }
              
              try {
                fs.copyFileSync(sourceFont, path.resolve(dir, 'Ionicons.ttf'));
                console.log(`Copied Ionicons font to ${dir}`);
              } catch (err) {
                console.warn(`Could not copy Ionicons font to ${dir}:`, err);
              }
            });
          });
        },
      });
    }

    return config;
  },
  
  // Add base path for assets in production
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configure asset prefix for proper loading
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Override the default Next.js transpilation
  transpilePackages: [
    'react-native', 
    'expo', 
    '@expo/vector-icons',
    'react-native-web',
    'react-native-reanimated'
  ],
  
  // Disable image optimization since Expo handles it
  images: {
    disableStaticImages: true,
  },
  
  // Explicitly include Ionicons in the build
  experimental: {
    optimizeCss: true,
    forceSwcTransforms: true,
  },
  
  // Allow importing font files in CSS
  modularizeImports: {
    '@expo/vector-icons': {
      transform: '@expo/vector-icons/{{member}}',
    },
  },
}; 