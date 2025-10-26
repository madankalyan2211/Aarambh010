# Firebase Authentication Setup Guide

This guide explains how to set up Firebase authentication with Google sign-in for the Aarambh LMS application.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase project credentials
3. Firebase Admin SDK credentials for the backend

## Setup Steps

### 1. Frontend Firebase Configuration

1. In your Firebase project, go to Project Settings
2. Under "General" tab, find your Firebase SDK configuration
3. Copy the following values to your `.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Backend Firebase Admin SDK Configuration

1. In your Firebase project, go to Project Settings
2. Under "Service accounts" tab, click "Generate new private key"
3. Download the JSON file and copy the following values to your server `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key (make sure to escape newlines with \\n)
```

### 3. Enable Authentication Methods

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Email/Password" and "Google" sign-in providers

## How It Works

1. Users can sign in with Google using Firebase Authentication
2. After successful Firebase authentication, the ID token is sent to the backend
3. Backend verifies the ID token using Firebase Admin SDK
4. User is created/updated in the MongoDB database
5. A JWT token is generated and returned to the frontend
6. Frontend stores the token and uses it for API requests

## Testing

1. Start the development server
2. Navigate to the login page
3. Click "Sign in with Google (Firebase)"
4. Complete the Google authentication flow
5. You should be redirected to the dashboard

## Troubleshooting

1. **Firebase config errors**: Make sure all environment variables are correctly set
2. **CORS issues**: Ensure your Firebase domain is added to allowed origins
3. **Token verification failures**: Check that Firebase Admin SDK credentials are correct