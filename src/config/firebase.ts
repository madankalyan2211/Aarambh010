import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || 'your-firebase-api-key',
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || 'your-firebase-auth-domain',
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || 'your-firebase-project-id',
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || 'your-firebase-storage-bucket',
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-firebase-messaging-sender-id',
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || 'your-firebase-app-id',
};

// Check if Firebase config is valid
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== 'your-firebase-api-key' && 
         firebaseConfig.apiKey.startsWith('AIzaSy') &&
         firebaseConfig.projectId && 
         firebaseConfig.projectId !== 'your-firebase-project-id';
};

// Initialize Firebase only if config is valid
let app: any;
let auth: any;
let googleProvider: any;

if (isFirebaseConfigValid()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    
    // Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Initialize with null values if there's an error
    app = null;
    auth = null;
    googleProvider = null;
  }
} else {
  console.warn('Firebase configuration is not valid. Firebase authentication will be disabled.');
  app = null;
  auth = null;
  googleProvider = null;
}

export { app, auth, googleProvider };