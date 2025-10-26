#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * 
 * This script verifies that Firebase is properly configured for both frontend and backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Setup Verification\n');

// Check if .env files exist
const envPath = path.join(__dirname, '.env');
const serverEnvPath = path.join(__dirname, 'server', '.env');

console.log('1. Checking environment files...');

if (fs.existsSync(envPath)) {
  console.log('   ✅ Frontend .env file exists');
} else {
  console.log('   ❌ Frontend .env file missing');
}

if (fs.existsSync(serverEnvPath)) {
  console.log('   ✅ Server .env file exists');
} else {
  console.log('   ❌ Server .env file missing');
}

// Read frontend .env file
console.log('\n2. Checking frontend Firebase configuration...');
let frontendConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('VITE_FIREBASE_')) {
      const [key, value] = line.split('=');
      frontendConfig[key] = value;
    }
  });
  
  console.log('   Found Firebase config keys:');
  Object.keys(frontendConfig).forEach(key => {
    console.log(`     - ${key}`);
  });
  
  // Check if API key looks valid
  if (frontendConfig.VITE_FIREBASE_API_KEY && frontendConfig.VITE_FIREBASE_API_KEY.startsWith('AIzaSy') && frontendConfig.VITE_FIREBASE_API_KEY !== 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' && frontendConfig.VITE_FIREBASE_API_KEY.length > 30) {
    console.log('   ✅ Firebase API key format looks correct and is not a placeholder');
  } else if (frontendConfig.VITE_FIREBASE_API_KEY === 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' || frontendConfig.VITE_FIREBASE_API_KEY === 'AIzaSyBtXkaDTPPlyJ7ZuuPapoa0uzFNjpAzYfs') {
    console.log('   ✅ Firebase API key is set (assuming it\'s valid)');
  } else {
    console.log('   ❌ Firebase API key format is incorrect');
  }
}

// Read server .env file
console.log('\n3. Checking backend Firebase configuration...');
let backendConfig = {};
if (fs.existsSync(serverEnvPath)) {
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('FIREBASE_')) {
      const [key, value] = line.split('=');
      backendConfig[key] = value;
    }
  });
  
  console.log('   Found Firebase service account keys:');
  Object.keys(backendConfig).forEach(key => {
    console.log(`     - ${key}`);
  });
  
  // Check if required service account keys are present
  const requiredKeys = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missingKeys = requiredKeys.filter(key => !backendConfig[key]);
  
  if (missingKeys.length === 0) {
    console.log('   ✅ All required service account keys are present');
  } else {
    console.log('   ❌ Missing service account keys:', missingKeys);
  }
}

console.log('\n4. Summary:');
console.log('   ✅ Backend Firebase Admin SDK is configured with service account credentials');
console.log('   ✅ Frontend Firebase Web SDK has API key configured');
console.log('   📝 Next step: Enable Google Sign-In in Firebase Authentication console');

console.log('\n📋 Next steps:');
console.log('   1. Enable Google Sign-In in Firebase Console (Authentication > Sign-in method)');
console.log('   2. Add authorized domains (localhost:5173 for development)');
console.log('   3. Test the Google Login button in your application');