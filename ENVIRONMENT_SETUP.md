# Environment Variables Setup Guide

This guide explains how to properly set up environment variables for the Aarambh LMS application.

## Important Security Notice

**Never commit sensitive information like passwords, API keys, or secrets to version control.** 
The [.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production) and [server/.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/server/.env.production) files have been added to [.gitignore](file:///Users/madanthambisetty/Downloads/Aarambh/.gitignore) to prevent accidental commits of sensitive data.

## Setting Up Environment Variables

### For Local Development

1. Copy the example files:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

2. Update the copied files with your actual values

### For Production Deployment

1. Copy the example files:
   ```bash
   cp .env.production.example .env.production
   cp server/.env.production.example server/.env.production
   ```

2. Update the copied files with your actual values

## Required Environment Variables

### Backend ([server/.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/server/.env.production))

| Variable | Description | Example |
|----------|-------------|---------|
| [MONGODB_URI](file:///Users/madanthambisetty/Downloads/Aarambh/server/generate-ai-course-content.js#L4-L4) | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| [JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L15-L15) | Secret for JWT token signing | `your-super-secret-jwt-key` |
| [GMAIL_USER](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L3-L3) | Gmail address for sending emails | `youremail@gmail.com` |
| [GMAIL_APP_PASSWORD](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L4-L4) | Gmail app password | `your-app-password` |
| [ALLOWED_ORIGINS](file:///Users/madanthambisetty/Downloads/Aarambh/server/server.js#L27-L27) | CORS allowed origins | `https://your-frontend.vercel.app` |
| [API_SECRET_KEY](file:///Users/madanthambisetty/Downloads/Aarambh/server/services/ai.service.js#L3-L3) | API security key | `your-api-secret-key` |

### Frontend ([.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production))

| Variable | Description | Example |
|----------|-------------|---------|
| [VITE_API_BASE_URL](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L70-L70) | Backend API URL | `https://your-backend.onrender.com/api` |
| [VITE_GMAIL_USER](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L15-L15) | Gmail address | `youremail@gmail.com` |
| [VITE_GMAIL_APP_PASSWORD](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L16-L16) | Gmail app password | `your-app-password` |
| [VITE_JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L80-L80) | JWT secret (for client-side operations) | `your-jwt-secret` |

## Platform-Specific Configuration

### Render (Backend)

Set these environment variables in your Render dashboard:
- [MONGODB_URI](file:///Users/madanthambisetty/Downloads/Aarambh/server/generate-ai-course-content.js#L4-L4)
- [JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L15-L15)
- [GMAIL_USER](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L3-L3)
- [GMAIL_APP_PASSWORD](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L4-L4)
- [ALLOWED_ORIGINS](file:///Users/madanthambisetty/Downloads/Aarambh/server/server.js#L27-L27)
- [API_SECRET_KEY](file:///Users/madanthambisetty/Downloads/Aarambh/server/services/ai.service.js#L3-L3)

### Vercel (Frontend)

Set these environment variables in your Vercel dashboard:
- [VITE_API_BASE_URL](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L70-L70)
- [VITE_GMAIL_USER](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L15-L15)
- [VITE_GMAIL_APP_PASSWORD](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L16-L16)
- [VITE_JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/src/config/env.ts#L80-L80)

## Security Best Practices

1. **Use App Passwords**: For Gmail, generate an App Password instead of using your regular password
2. **Restrict MongoDB Access**: Only allow connections from known IP addresses
3. **Rotate Secrets Regularly**: Change your secrets and API keys periodically
4. **Environment-Specific Variables**: Use different secrets for development, staging, and production
5. **Never Log Secrets**: Ensure your application doesn't log sensitive information

## Troubleshooting

If you encounter issues with environment variables:

1. Verify all required variables are set
2. Check for typos in variable names
3. Ensure proper file permissions
4. Confirm the files are in the correct location
5. Restart your development servers after changes

For deployment-specific issues, refer to:
- [RENDER_DEPLOYMENT_TROUBLESHOOTING.md](RENDER_DEPLOYMENT_TROUBLESHOOTING.md) for Render deployment
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for general deployment instructions