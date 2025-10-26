// Test Firebase configuration validation
const testFirebaseConfig = () => {
  const firebaseApiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY || 'your-firebase-api-key';
  
  console.log('Firebase API Key:', firebaseApiKey);
  console.log('API Key Length:', firebaseApiKey.length);
  console.log('Starts with AIzaSy:', firebaseApiKey.startsWith('AIzaSy'));
  console.log('Is Valid Format:', firebaseApiKey.startsWith('AIzaSy') && firebaseApiKey.length > 30);
  
  return {
    apiKey: firebaseApiKey,
    isValid: firebaseApiKey.startsWith('AIzaSy') && firebaseApiKey.length > 30
  };
};

// Run the test
const result = testFirebaseConfig();
console.log('Firebase Configuration Test Result:', result);

export {};