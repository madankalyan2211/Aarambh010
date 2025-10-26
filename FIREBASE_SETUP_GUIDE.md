# Firebase Setup Guide for Aarambh LMS

This guide will help you properly configure Firebase for the Aarambh LMS application.

## 🔧 Prerequisites

1. A Google account
2. Access to the Firebase Console: https://console.firebase.google.com/
3. Node.js installed (version 18 or higher)

## 🚀 Firebase Project Setup

### 1. Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter project name: `Aarambh LMS`
4. Accept the terms and conditions
5. Disable Google Analytics (optional)
6. Click "Create project"

### 2. Register Your Web App

1. In the Firebase Console, click the web icon (</>) to register a new app
2. Enter app nickname: `Aarambh LMS Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this for your frontend

### 3. Enable Authentication Methods

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the following providers:
   - Email/Password
   - Google

### 4. Generate Service Account Key (Backend)

1. In the Firebase Console, go to "Project settings" (gear icon)
2. Click the "Service accounts" tab
3. Click "Generate new private key"
4. Confirm by clicking "Generate key"
5. A JSON file will be downloaded - this contains your service account credentials

## 🔐 Environment Configuration

### Frontend Configuration

Update your root [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env) file with the Firebase Web SDK configuration:

```env
# Firebase Web SDK Configuration (for frontend)
VITE_FIREBASE_API_KEY=your-api-key-from-firebase-config
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend Configuration

Update your server [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env) file with the Firebase Admin SDK configuration:

```env
# Firebase Admin SDK Configuration (for backend)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email-from-json
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-client-x509-cert-url-from-json
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

## 🛠️ Troubleshooting Common Issues

### Invalid JWT Signature Error

This error occurs when the service account key is invalid or revoked:

1. **Generate a new service account key**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Replace the old credentials in your [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env) files

2. **Check system time synchronization**:
   - Ensure your system clock is accurate
   - On macOS: System Preferences > Date & Time > Set automatically
   - On Windows: Settings > Time & Language > Date & Time > Set time automatically

### CORS Issues

If you encounter CORS errors with Firebase authentication:

1. Add your domain to Firebase authorized domains:
   - Firebase Console > Authentication > Sign-in method > Authorized domains
   - Add `localhost` for development
   - Add your production domain for deployment

### Environment Variables Not Loading

1. **Verify [.gitignore](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/server/.gitignore) configuration**:
   - Ensure [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env) files are not committed to version control

2. **Check file paths**:
   - Root [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env): `/Users/madanthambisetty/Downloads/Aarambh01-main 3/.env`
   - Server [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env): `/Users/madanthambisetty/Downloads/Aarambh01-main 3/server/.env`

## 🧪 Testing Firebase Configuration

### Run the validation script:

```bash
cd server
node validate-firebase-config.js
```

### Run the authentication test:

```bash
cd server
node test-firebase-auth.js
```

## 🔒 Security Best Practices

1. **Never commit credentials to version control**
   - [.gitignore](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/server/.gitignore) files should exclude [.env](file:///Users/madanthambisetty/Downloads/Aarambh01-main%203/src/config/.env) files
   - Use environment variables in production

2. **Rotate service account keys regularly**
   - Generate new keys every 90 days
   - Revoke old keys after transitioning to new ones

3. **Use least privilege principle**
   - Only grant necessary permissions to service accounts
   - Use Firebase Security Rules to restrict database access

## 🚀 Production Deployment

### For Render.com:

1. Set environment variables in Render dashboard:
   - Go to your service > Environment
   - Add each Firebase variable as a separate key-value pair

### For AWS:

1. Use AWS Secrets Manager:
   ```bash
   aws secretsmanager create-secret \
     --name "Aarambh/FirebaseAdmin" \
     --description "Firebase Admin SDK credentials" \
     --secret-string '{"type":"service_account","project_id":"your-project-id",...}'
   ```

### For Google Cloud:

1. Use Google Secret Manager:
   ```bash
   echo -n "your-private-key-here" | gcloud secrets create firebase-private-key --data-file=-
   ```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)