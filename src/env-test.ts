// Environment variable test
console.log('Environment Variable Test:');

// Test Firebase environment variables
console.log('VITE_FIREBASE_API_KEY:', (import.meta as any).env.VITE_FIREBASE_API_KEY);
console.log('VITE_FIREBASE_AUTH_DOMAIN:', (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('VITE_FIREBASE_PROJECT_ID:', (import.meta as any).env.VITE_FIREBASE_PROJECT_ID);
console.log('VITE_FIREBASE_STORAGE_BUCKET:', (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('VITE_FIREBASE_MESSAGING_SENDER_ID:', (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('VITE_FIREBASE_APP_ID:', (import.meta as any).env.VITE_FIREBASE_APP_ID);

// Check if all required Firebase variables are present
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !(import.meta as any).env[varName]);

if (missingVars.length === 0) {
  console.log('✅ All Firebase environment variables are present');
} else {
  console.log('❌ Missing Firebase environment variables:', missingVars);
}