# Render Deployment Guide for Aarambh Backend

This guide will help you deploy the Aarambh LMS backend to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
3. A Gmail account with App Password configured (for email services)
4. The project code (this repository)

## Deployment Steps

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster or use an existing one
3. Get your MongoDB connection string:
   - Go to "Database Access" > "Connect" > "Connect your application"
   - Copy the connection string

### 2. Configure MongoDB IP Whitelist

For Render deployment, you have two options:

#### Option A: Allow all IPs (Easiest for testing)
1. In MongoDB Atlas, go to "Network Access"
2. Add IP Address: `0.0.0.0/0`
3. Add a comment like "Allow all IPs for Render deployment"

#### Option B: Add Render IPs (More secure)
1. You'll need to add Render's IP addresses to your MongoDB whitelist
2. Since Render doesn't provide static IPs on the free plan, you may need to:
   - Upgrade to a paid Render plan with static IPs
   - Use MongoDB Atlas Private Endpoints (enterprise feature)
   - Deploy a proxy service with a static IP

### 3. Configure Gmail App Password

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Save this password securely

### 4. Deploy to Render

#### Option A: Deploy from Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render, click **New** → **Web Service**
3. Connect your repository
4. Configure the service:
   - Name: `aarambh-backend`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Choose between Free or Paid

#### Option B: Manual Deployment

1. Create a new Web Service in Render
2. Choose "Manual Deploy"
3. Upload your code as a zip file

### 5. Configure Environment Variables

In Render, go to your service → **Environment** and add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:password@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key` |
| `GMAIL_USER` | Your Gmail address | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Your Gmail App Password | `abcd efgh ijkl mnop` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs | `https://your-frontend.onrender.com,https://aarambh-frontend.vercel.app` |
| `API_SECRET_KEY` | Secret key for API authentication | `your-api-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `AIzaSyB123456789...` |
| `GROQ_API_KEY` | Groq API key for AI content generation (optional) | `gsk_123456789...` |

### 6. Deploy the Service

1. Click **Create Web Service**
2. Render will automatically start building and deploying your application
3. Monitor the build logs for any errors

### 7. Verify Deployment

1. Once deployed, visit your service URL: `https://your-service-name.onrender.com`
2. Check the health endpoint: `https://your-service-name.onrender.com/health`
3. You should see a JSON response indicating the server is running

## Environment Variables Required

Here are all the environment variables you need to configure in Render:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
ALLOWED_ORIGINS=https://your-frontend-url.com
API_SECRET_KEY=your_api_secret_key
GEMINI_API_KEY=your_gemini_api_key_optional
GROQ_API_KEY=your_groq_api_key_optional
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Ensure your MongoDB IP whitelist includes Render's IPs
   - Verify your connection string is correct
   - Check that your MongoDB credentials are valid

2. **Email Service Issues**
   - Confirm your Gmail App Password is correct
   - Ensure 2-Factor Authentication is enabled
   - Check that Gmail SMTP settings are correct

3. **CORS Errors**
   - Verify that `ALLOWED_ORIGINS` includes your frontend URL
   - Make sure there are no trailing slashes in URLs

4. **Build Failures**
   - Check that all dependencies are correctly listed in package.json
   - Ensure Node.js version compatibility

### Logs and Monitoring

1. View logs in Render:
   - Go to your service → **Logs**
   - Monitor for any errors during startup or runtime

2. Health Check:
   - Visit `https://your-service.onrender.com/health`
   - This endpoint shows MongoDB connection status and uptime

## Scaling and Performance

### Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- Limited resources
- No static IPs

### Upgrading to Paid Plan

Consider upgrading to a paid plan for:
- Always-on instances
- Static IPs
- Better performance
- Custom domains with SSL

## Additional Notes

- The application uses port 3001 by default, but Render will provide the PORT environment variable
- The application automatically adapts to Render's environment using the PORT variable
- Health checks are available at `/health` endpoint
- WebSocket support is enabled for real-time features