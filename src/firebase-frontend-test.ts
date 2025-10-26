// Firebase frontend configuration test
export const testFirebaseFrontendConfig = () => {
  const config = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  };

  console.log('Firebase Frontend Config Test:');
  console.log('API Key:', config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'MISSING');
  console.log('Auth Domain:', config.authDomain || 'MISSING');
  console.log('Project ID:', config.projectId || 'MISSING');
  console.log('Storage Bucket:', config.storageBucket || 'MISSING');
  console.log('Messaging Sender ID:', config.messagingSenderId || 'MISSING');
  console.log('App ID:', config.appId || 'MISSING');

  const isConfigured = config.apiKey && 
                      config.apiKey.startsWith('AIzaSy') &&
                      config.projectId &&
                      config.authDomain;

  console.log('Is Firebase Frontend Configured:', isConfigured);
  return isConfigured;
};

// Run the test
testFirebaseFrontendConfig();