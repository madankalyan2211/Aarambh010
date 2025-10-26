#!/usr/bin/env node

/**
 * Firebase Configuration Validator
 * 
 * This script validates that all required Firebase environment variables
 * are present in the current environment.
 * 
 * Usage:
 *   node validate-firebase-config.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Required Firebase environment variables for Admin SDK
const requiredFirebaseVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
  'FIREBASE_CLIENT_X509_CERT_URL',
  'FIREBASE_UNIVERSE_DOMAIN'
];

// Required Firebase environment variables for Web SDK (frontend)
const requiredFirebaseWebVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('🔍 Validating Firebase Configuration...\n');

// Check Admin SDK variables
console.log('🔐 Firebase Admin SDK Configuration:');
let adminSdkValid = true;
const missingAdminVars = [];

for (const varName of requiredFirebaseVars) {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Present`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    missingAdminVars.push(varName);
    adminSdkValid = false;
  }
}

console.log('\n🌐 Firebase Web SDK Configuration:');
let webSdkValid = true;
const missingWebVars = [];

for (const varName of requiredFirebaseWebVars) {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Present`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    missingWebVars.push(varName);
    webSdkValid = false;
  }
}

console.log('\n📋 Summary:');
if (adminSdkValid) {
  console.log('  ✅ Firebase Admin SDK: All required variables present');
} else {
  console.log(`  ❌ Firebase Admin SDK: Missing ${missingAdminVars.length} variables`);
  console.log('     Missing variables:', missingAdminVars.join(', '));
}

if (webSdkValid) {
  console.log('  ✅ Firebase Web SDK: All required variables present');
} else {
  console.log(`  ❌ Firebase Web SDK: Missing ${missingWebVars.length} variables`);
  console.log('     Missing variables:', missingWebVars.join(', '));
}

if (adminSdkValid && webSdkValid) {
  console.log('\n🎉 All Firebase configurations are valid!');
  process.exit(0);
} else {
  console.log('\n⚠️  Firebase configuration issues detected. Please check the missing variables above.');
  process.exit(1);
}