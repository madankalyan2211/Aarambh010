import { isDevelopment } from './config/env';

// Simple test to check if Firebase is configured
export const checkFirebaseConfig = () => {
  const firebaseApiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;
  const firebaseProjectId = (import.meta as any).env.VITE_FIREBASE_PROJECT_ID;
  
  console.log('Firebase Config Check:');
  console.log('- VITE_FIREBASE_API_KEY:', firebaseApiKey ? `${firebaseApiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('- VITE_FIREBASE_PROJECT_ID:', firebaseProjectId || 'NOT SET');
  
  const isConfigured = firebaseApiKey && 
                       firebaseApiKey !== 'your-api-key-from-firebase-config' && 
                       firebaseApiKey.startsWith('AIzaSy') &&
                       firebaseProjectId && 
                       firebaseProjectId !== 'your-project-id';
                       
  console.log('- Is Firebase Configured:', isConfigured);
  
  return isConfigured;
};

// Run the check
checkFirebaseConfig();