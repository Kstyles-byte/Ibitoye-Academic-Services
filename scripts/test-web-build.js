const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Define the port for the local server
const PORT = 5000;

// First build the web app
console.log('Building the web app...');
exec('npm run build:web', (err, stdout, stderr) => {
  if (err) {
    console.error('Error building the web app:', err);
    console.error(stderr);
    process.exit(1);
  }
  
  console.log(stdout);
  console.log('Web build complete. Starting local server...');
  
  // Start a simple HTTP server to serve the dist directory
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', 'dist', req.url === '/' ? 'index.html' : req.url);
    
    // If the path doesn't have an extension, assume it's a route and serve index.html
    if (!path.extname(filePath) && !fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', 'dist', 'index.html');
    }
    
    // Determine the content type based on the file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File not found
          console.error(`File not found: ${filePath}`);
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          // Server error
          console.error(`Server error: ${err.code}`);
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
  
  // Start the server
  server.listen(PORT, () => {
    console.log(`\nTest server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
    
    // Open the browser automatically
    const startCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCommand} http://localhost:${PORT}/`);
  });
}); 