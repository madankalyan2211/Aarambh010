import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { env } from './config/env';
import { Auth0Provider } from '@auth0/auth0-react';
import { checkFirebaseConfig } from './firebase-config-check';
import { testAuthToken } from './token-test';

// Check Firebase configuration
const isFirebaseConfigured = checkFirebaseConfig();

// Test auth token
testAuthToken();

// Check if API base URL is properly configured
// Only show warning in production when API base URL is not set
if (env.appEnv === 'production' && !env.apiBaseUrl) {
  console.warn('⚠️  API Base URL might not be properly configured for production!');
  console.warn('🔧 Current API Base URL:', env.apiBaseUrl);
  console.error('❌ CRITICAL: API Base URL is not configured for production environment!');
  console.error('🔧 Please check your environment variables configuration.');
}

// Check if Auth0 is properly configured
const isAuth0Configured = env.auth0Domain && 
                          env.auth0Domain !== 'your-auth0-domain.auth0.com' && 
                          env.auth0ClientId && 
                          env.auth0ClientId !== 'your-auth0-client-id' &&
                          env.auth0Domain.includes('.') && 
                          env.auth0ClientId.length > 10;

// Add a simple test element to verify React is working
const rootElement = document.getElementById('root');
if (rootElement) {
  // Add a simple loading indicator
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
      <div style="text-align: center;">
        <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3B82F6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px; color: #666;">Loading Aarambh LMS...</p>
        ${isAuth0Configured ? '<p style="margin-top: 10px; color: #3B82F6; font-size: 14px;">Auth0 Enabled</p>' : '<p style="margin-top: 10px; color: #999; font-size: 14px;">Auth0 Disabled</p>'}
        ${isFirebaseConfigured ? '<p style="margin-top: 10px; color: #3B82F6; font-size: 14px;">Firebase Enabled</p>' : '<p style="margin-top: 10px; color: #999; font-size: 14px;">Firebase Disabled</p>'}
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  try {
    // Small delay to show the loading indicator
    setTimeout(() => {
      const appContent = (
        <React.StrictMode>
          {/* Render App without Auth0 provider since we're using direct Google OAuth */}
          <App />
        </React.StrictMode>
      );
      
      const root = ReactDOM.createRoot(rootElement);
      root.render(appContent);
    }, 1000);
  } catch (error) {
    console.error('❌ Failed to render application:', error);
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #fee; color: #c33;">
        <div style="text-align: center; padding: 20px; border-radius: 8px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #c33;">❌ Application Error</h2>
          <p>Failed to start Aarambh LMS. Please check the console for details.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 15px;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}