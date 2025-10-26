// Firebase configuration check
export const checkFirebaseConfig = () => {
  const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  };

  console.log('Firebase Configuration Check:');
  console.log('- API Key:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING');
  console.log('- Auth Domain:', firebaseConfig.authDomain || 'MISSING');
  console.log('- Project ID:', firebaseConfig.projectId || 'MISSING');
  console.log('- Storage Bucket:', firebaseConfig.storageBucket || 'MISSING');
  console.log('- Messaging Sender ID:', firebaseConfig.messagingSenderId || 'MISSING');
  console.log('- App ID:', firebaseConfig.appId || 'MISSING');

  const isConfigured = firebaseConfig.apiKey && 
                       firebaseConfig.apiKey.startsWith('AIzaSy') && 
                       firebaseConfig.apiKey.length > 30 &&
                       firebaseConfig.authDomain &&
                       firebaseConfig.projectId &&
                       firebaseConfig.storageBucket &&
                       firebaseConfig.messagingSenderId &&
                       firebaseConfig.appId;

  console.log('- Is Firebase Configured:', isConfigured);
  
  return isConfigured;
};

// Run the check
checkFirebaseConfig();