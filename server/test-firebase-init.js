// Test script to check Firebase Admin SDK initialization
console.log('Testing Firebase Admin SDK initialization...');

// Check if required environment variables are present
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

console.log('Environment variables check:');
requiredEnvVars.forEach(envVar => {
  console.log(`  ${envVar}: ${process.env[envVar] ? '✅ Present' : '❌ Missing'}`);
});

if (missingEnvVars.length > 0) {
  console.log('❌ Missing Firebase environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// Try to initialize Firebase Admin SDK
try {
  const admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    console.log('Initializing Firebase Admin SDK...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.log('✅ Firebase Admin SDK already initialized');
  }
  
  console.log('✅ All Firebase initialization tests passed');
  
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}