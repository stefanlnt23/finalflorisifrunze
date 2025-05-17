
const { spawn } = require('child_process');
const path = require('path');

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Function to start the server
function startServer() {
  log('Starting server...');
  
  const server = spawn('node', ['dist/server/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('close', (code) => {
    log(`Server process exited with code ${code}`);
    
    if (code !== 0) {
      log('Server crashed, restarting in 5 seconds...');
      setTimeout(startServer, 5000);
    }
  });
  
  // Handle possible errors
  server.on('error', (err) => {
    log(`Failed to start server: ${err}`);
    log('Attempting to restart in 5 seconds...');
    setTimeout(startServer, 5000);
  });
}

// Start the server
startServer();
