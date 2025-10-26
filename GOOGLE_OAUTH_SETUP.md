# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your Aarambh LMS application.

## Prerequisites

1. A Google Account
2. Access to the Google Cloud Console
3. A project in Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "Aarambh LMS")
4. Click "Create"

## Step 2: Enable the Google+ API

1. In the Google Cloud Console, make sure your project is selected
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google+ API"
4. Click on "Google+ API" and then click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Select "External" for User Type
   - Fill in the required fields:
     - App name: Aarambh LMS
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - For scopes, click "Save and Continue"
   - For test users, add your email address and click "Save and Continue"
   - Click "Back to Dashboard"
4. Now create the OAuth client ID:
   - Application type: Web application
   - Name: Aarambh LMS
   - Authorized JavaScript origins:
     - http://localhost:5173
     - http://localhost:5174
     - Your production domain (when ready)
   - Authorized redirect URIs:
     - http://localhost:5173/auth/google/callback
     - http://localhost:5174/auth/google/callback
     - Your production callback URL (when ready)
   - Click "Create"

## Step 4: Get Your Credentials

After creating the OAuth client ID, you'll see:
- Client ID
- Client Secret

Save these values securely.

## Step 5: Update Environment Variables

Update your `.env` file with your Google OAuth credentials:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

## Step 6: Backend Implementation

You'll need to implement the backend endpoints to handle the OAuth flow:

1. `/auth/google` - Initiates the OAuth flow
2. `/auth/google/callback` - Handles the callback from Google

## Step 7: Frontend Implementation

The frontend implementation is already partially in place. When you have real credentials:

1. The Google sign-in button will initiate the OAuth flow
2. Users will be redirected to Google to authenticate
3. After authentication, Google will redirect back to your app
4. Your app will exchange the authorization code for an access token
5. User information will be retrieved from Google
6. A user account will be created or updated in your system
7. The user will be logged in

## Testing

1. Make sure your development server is running
2. Click the "Sign in with Google" button
3. You should be redirected to Google's authentication page
4. After authenticating, you should be redirected back to your app
5. The user should be logged in

## Troubleshooting

### "Unknown Host" Error
This error occurs when the Auth0 domain is incorrectly configured. We've disabled Auth0 and are using direct Google OAuth instead.

### "Invalid Client" Error
This occurs when the Google Client ID is incorrect or not properly configured in the Google Cloud Console.

### "Redirect URI Mismatch" Error
This occurs when the redirect URI in your Google OAuth configuration doesn't match the one in your application.

Make sure to:
1. Add all necessary redirect URIs in the Google Cloud Console
2. Use HTTPS in production
3. Ensure the redirect URI matches exactly (including trailing slashes)

## Security Considerations

1. Never commit your client secret to version control
2. Use environment variables to store sensitive information
3. Implement proper session management
4. Use HTTPS in production
5. Validate all data received from Google
6. Implement rate limiting for authentication endpoints