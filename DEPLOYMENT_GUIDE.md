# Aarambh LMS Deployment Guide

This guide will help you deploy the Aarambh Learning Management System to Render (backend) and Vercel (frontend).

## Prerequisites

1. Accounts:
   - [Render](https://render.com/) account
   - [Vercel](https://vercel.com/) account
   - MongoDB Atlas account (or other MongoDB hosting service)

2. Tools:
   - Git
   - Node.js (v16 or higher)
   - npm or yarn

## Backend Deployment (Render)

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: aarambh-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: main (or your default branch)

### 3. Configure Environment Variables

In the Render dashboard, go to your service settings and add these environment variables:

| Key | Value (Description) |
|-----|---------------------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A strong secret key for JWT tokens |
| `GMAIL_USER` | Your Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Your Gmail app password |
| `GMAIL_FROM_NAME` | `Aarambh LMS` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `OTP_EXPIRY_MINUTES` | `10` |
| `OTP_LENGTH` | `6` |
| `OTP_MAX_ATTEMPTS` | `3` |
| `ALLOWED_ORIGINS` | Your frontend URL (e.g., `https://your-app.vercel.app`) |
| `API_SECRET_KEY` | A strong secret key for API security |
| `GEMINI_API_KEY` | Your Gemini API key (optional) |
| `GROQ_API_KEY` | Your Groq API key (optional) |

### 4. Deploy

Click "Create Web Service" and wait for the deployment to complete.

Note the URL of your deployed backend (e.g., `https://aarambh-backend.onrender.com`).

## Frontend Deployment (Vercel)

### 1. Update Environment Variables

Before deploying to Vercel, update the [.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production) file with your actual backend URL:

```
VITE_API_BASE_URL=https://your-render-app-url.onrender.com/api
VITE_APP_URL=https://your-vercel-app.vercel.app
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `/` (root of your repository)
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

### 3. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

| Key | Value (Description) |
|-----|---------------------|
| `VITE_API_BASE_URL` | Your Render backend URL (e.g., `https://aarambh-backend.onrender.com/api`) |
| `VITE_APP_ENV` | `production` |
| `VITE_DEBUG_MODE` | `false` |
| `VITE_APP_URL` | Your Vercel app URL |

### 4. Deploy

Click "Deploy" and wait for the deployment to complete.

## Post-Deployment Configuration

### 1. Update CORS Settings

After deploying both frontend and backend, update the `ALLOWED_ORIGINS` environment variable in Render with your Vercel app URL:

```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-render-app.onrender.com
```

### 2. Test the Deployment

1. Visit your frontend URL
2. Try to register a new user
3. Check if emails are being sent
4. Verify that you can log in with the OTP

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your frontend URL
2. **Email Not Sending**: Verify your Gmail credentials and app password
3. **Database Connection**: Check your MongoDB URI and network access
4. **Environment Variables**: Ensure all required environment variables are set

### Logs and Monitoring

- Check Render logs for backend issues
- Check Vercel logs for frontend issues
- Monitor MongoDB Atlas for database connection issues

## Updating Your Deployment

To update your deployed application:

1. Push changes to your Git repository
2. Render will automatically redeploy the backend
3. Vercel will automatically redeploy the frontend

For manual deployment:
- Render: Go to your service dashboard and click "Manual Deploy"
- Vercel: Go to your project dashboard and click "Redeploy"

## Security Considerations

1. Never commit sensitive information like API keys to version control
2. Use strong, unique passwords for all services
3. Regularly rotate your API keys and secrets
4. Enable two-factor authentication on all accounts
5. Use HTTPS for all communications
6. Regularly update dependencies to patch security vulnerabilities

## Support

If you encounter issues with deployment, check the documentation for:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

For Aarambh-specific issues, please open an issue on the GitHub repository.