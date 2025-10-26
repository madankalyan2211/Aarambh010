import React from 'react';
import { Button } from './ui/button';
import { Chrome } from 'lucide-react';

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function GoogleLoginButton({ onClick, isLoading = false }: GoogleLoginButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
      disabled={isLoading}
    >
      <Chrome className="mr-2 h-5 w-5 text-red-500" />
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
}