import { useEffect } from 'react';
import { processGoogleOAuthToken } from '../services/googleAuth.service';
import { UserRole } from '../App';

interface GoogleOAuthCallbackProps {
  onLogin: (role: UserRole, name?: string, email?: string) => void;
}

export function GoogleOAuthCallback({ onLogin }: GoogleOAuthCallbackProps) {
  useEffect(() => {
    // Get token and user data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(decodeURIComponent(userData));
        processGoogleOAuthToken(token, parsedUserData);
        
        // Call the onLogin callback with user data
        onLogin(
          parsedUserData.role as UserRole,
          parsedUserData.name,
          parsedUserData.email
        );
        
        // Redirect to dashboard by changing the URL hash
        window.location.hash = '#dashboard';
      } catch (error) {
        console.error('Error processing Google OAuth callback:', error);
        // Redirect to login page
        window.location.hash = '#login';
      }
    } else {
      // Redirect to login page
      window.location.hash = '#login';
    }
  }, [onLogin]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Processing Google sign-in...</p>
      </div>
    </div>
  );
}