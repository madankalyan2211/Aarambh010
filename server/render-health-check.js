#!/usr/bin/env node

/**
 * Simple health check script for Render deployment
 * This script can be used as a separate health check service or for testing
 */

const http = require('http');

// Get the port from environment or default to 3001
const PORT = process.env.PORT || 3001;

// Create a simple HTTP server for health checks
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'Aarambh Backend Health Check',
      timestamp: new Date().toISOString(),
      platform: process.env.RENDER ? 'Render' : 'Local',
      port: PORT,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }, null, 2));
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: 'Health check service only responds to /health or /',
  }));
});

server.listen(PORT, () => {
  console.log(`🏥 Aarambh Health Check Service`);
  console.log(`📍 Listening on port ${PORT}`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`🔄 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log(`🚀 Ready for Render deployment!`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Health check server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
});