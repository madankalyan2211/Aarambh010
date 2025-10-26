# Aarambh LMS Deployment Guide

This guide provides instructions for deploying the Aarambh Learning Management System to Render (backend) and Vercel (frontend) using Git-based deployment.

## Prerequisites

1. Node.js >= 18.0.0
2. npm or yarn
3. Git
4. GitHub account
5. Render account (for backend deployment)
6. Vercel account (for frontend deployment)

## Backend Deployment to Render (Git-based)

### 1. Prepare Environment Variables

Update the `server/.env.production` file with your actual configuration values:

```bash
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# Email Configuration (Gmail)
GMAIL_USER=your_gmail_address_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Firebase Admin SDK Configuration
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here
FIREBASE_CLIENT_ID=your_firebase_client_id_here
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url_here
```

### 2. Deploy to Render via Git

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" -> "Web Service"
3. Connect your GitHub account
4. Select your repository: `madankalyan2211/Aarambh010`
5. Configure the following settings:
   - **Name**: `aarambh-backend`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan for production)
6. Add environment variables from `server/.env.production`
7. Click "Create Web Service"

### 3. Post-Deployment Configuration

After deployment, update your MongoDB Atlas IP whitelist to include Render's IP addresses.

## Frontend Deployment to Vercel (Git-based)

### 1. Configure Environment Variables

Update the `.env.production` file with your production configuration:

```bash
# Backend API Configuration
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api

# Application Configuration
VITE_APP_URL=https://your-vercel-url.vercel.app
```

### 2. Deploy to Vercel via Git

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect your Git provider (GitHub)
4. Select your repository: `madankalyan2211/Aarambh010`
5. Configure project settings:
   - **Project Name**: `aarambh-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables from `.env.production`
7. Click "Deploy"

### 3. Custom Domain (Optional)

After deployment, you can configure a custom domain in the Vercel console:
1. Go to your project in the Vercel dashboard
2. Click "Settings" → "Domains"
3. Click "Add"
4. Follow the instructions to add your custom domain

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT token generation | Yes |
| `GMAIL_USER` | Gmail address for sending emails | Yes |
| `GMAIL_APP_PASSWORD` | Gmail app password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `FIREBASE_*` | Firebase Admin SDK credentials | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | Yes |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS configuration allows requests from your frontend domain.

2. **MongoDB Connection Issues**: Verify your MongoDB Atlas IP whitelist includes your deployment environment IPs.

3. **Firebase Authentication Issues**: Check that all Firebase configuration variables are correctly set.

4. **Email Sending Issues**: Ensure your Gmail app password is correctly configured.

### Logs and Monitoring

- Render: Check logs in the Render dashboard
- Vercel: Check logs in the Vercel dashboard
- Application: Enable debug logging by setting `DEBUG=*` environment variable

## Security Considerations

1. Never commit sensitive credentials to version control
2. Use environment variables for all secrets
3. Rotate JWT secrets regularly
4. Use strong, unique passwords for all services
5. Enable two-factor authentication where possible
6. Regularly update dependencies to patch security vulnerabilities

## Scaling Considerations

1. **Render**: Upgrade to a paid plan for better performance and reliability
2. **Vercel**: Consider using Vercel's pro plan for better performance
3. **MongoDB**: Use a dedicated cluster for production workloads
4. **Email**: Consider using a dedicated email service like SendGrid or AWS SES for production

## Maintenance

1. Regularly backup your MongoDB database
2. Monitor application logs for errors
3. Update dependencies regularly
4. Review and rotate API keys and secrets periodically
5. Monitor usage and costs on Render and Vercel