import React from 'react';
import { Button } from './ui/button';
import { Chrome } from 'lucide-react';

interface FirebaseGoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function FirebaseGoogleLoginButton({ onClick, isLoading = false, isDisabled = false }: FirebaseGoogleLoginButtonProps) {
  const handleClick = () => {
    if (isDisabled) {
      alert('Firebase authentication is not properly configured. Please contact the administrator.');
      return;
    }
    onClick();
  };

  return (
    <Button 
      onClick={handleClick}
      className="w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
      disabled={isLoading || isDisabled}
    >
      <Chrome className="mr-2 h-5 w-5 text-red-500" />
      {isLoading ? 'Signing in with Google...' : 
       isDisabled ? 'Google Sign-In Unavailable' : 
       'Sign in with Google (Firebase)'}
    </Button>
  );
}