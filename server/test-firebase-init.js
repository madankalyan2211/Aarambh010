require('dotenv').config();
const admin = require('firebase-admin');

console.log('Testing Firebase Admin SDK initialization...');

// Check if required environment variables are present
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

console.log('Environment variables status:');
requiredEnvVars.forEach(envVar => {
  console.log(`${envVar}: ${process.env[envVar] ? '[SET]' : '[NOT SET]'}`);
});

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

try {
  // Try to initialize Firebase Admin SDK
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
  
  console.log('✅ Firebase configuration test passed');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}