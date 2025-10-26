// Simple API test with HTTP
const http = require('http');

// Test the health endpoint
const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/health',
  method: 'GET'
};

console.log('Testing health endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();