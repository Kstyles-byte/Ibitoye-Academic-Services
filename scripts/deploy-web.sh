#!/bin/bash
# Web deployment script

echo "Starting web build process..."

# Build the web app
npm run build:web

# Ensure all web files are in the dist directory
echo "Copying web-specific files..."
mkdir -p dist
cp -r app/web/* dist/

# Make sure style.css is properly copied
if [ -f dist/style.css ]; then
    echo "Style.css successfully copied"
else
    echo "ERROR: style.css not found in dist directory"
    exit 1
fi

# Make sure Ionicons are available
if grep -q "ionicons" dist/index.html; then
    echo "Ionicons references found in index.html"
else
    echo "WARNING: Ionicons references not found in index.html"
fi

echo "Web build complete and ready for deployment"
echo "To deploy to Vercel, run: vercel --prod" 