// Simple API test
const https = require('https');

// Test the health endpoint
const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/health',
  method: 'GET',
  rejectUnauthorized: false // For testing localhost
};

console.log('Testing health endpoint...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();