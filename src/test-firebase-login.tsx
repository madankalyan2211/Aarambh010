import React, { useState } from 'react';
import { FirebaseGoogleLoginButton } from './components/FirebaseGoogleLoginButton';
import { signInWithGoogle } from './services/firebaseAuth.service';

export function TestFirebaseLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const user = await signInWithGoogle('student');
      setResult(user);
      console.log('Google Sign-In Successful:', user);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
      console.error('Google Sign-In Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Firebase Google Login Test</h2>
      
      <FirebaseGoogleLoginButton 
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      />
      
      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#efe', color: '#363', borderRadius: '4px' }}>
          <strong>Success!</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}