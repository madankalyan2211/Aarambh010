import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, AlertCircle, Chrome } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';

interface Auth0LoginProps {
  onLogin: (role: 'student' | 'teacher' | 'admin', name: string, email: string) => void;
  connection?: string; // For specifying Auth0 connection (e.g., 'google-oauth2')
}

export function Auth0Login({ onLogin, connection }: Auth0LoginProps) {
  const { loginWithRedirect, isLoading, isAuthenticated, user, error } = useAuth0();

  // Handle successful authentication
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Store user data in localStorage
      const userData = {
        email: user.email || '',
        name: user.name || user.email?.split('@')[0] || 'User',
        role: 'student' // Default role, can be updated later
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('authMethod', 'auth0');
      
      // Call the onLogin callback
      onLogin(
        userData.role as 'student' | 'teacher' | 'admin',
        userData.name,
        userData.email
      );
    }
  }, [isAuthenticated, user, onLogin]);

  const handleLogin = async (connectionType?: string) => {
    try {
      const options: any = {
        authorizationParams: {
          redirect_uri: window.location.origin
        }
      };
      
      // If a specific connection is requested (like Google), use it
      if (connectionType) {
        options.authorizationParams.connection = connectionType;
      } else if (connection) {
        options.authorizationParams.connection = connection;
      }
      
      await loginWithRedirect(options);
    } catch (err) {
      console.error('Auth0 login error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to Aarambh LMS</CardTitle>
        <CardDescription>Sign in with Auth0 to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        )}
        
        {/* Google Sign In Button */}
        <GoogleLoginButton 
          onClick={() => handleLogin('google-oauth2')}
          isLoading={isLoading}
        />
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        {/* General Auth0 Sign In Button */}
        <Button 
          onClick={() => handleLogin()}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in with Auth0'
          )}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Don't have an account? Auth0 will create one for you during sign in.</p>
        </div>
      </CardContent>
    </Card>
  );
}