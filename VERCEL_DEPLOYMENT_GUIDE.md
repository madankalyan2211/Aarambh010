# Vercel Deployment Guide

This guide explains how to deploy the Aarambh LMS frontend to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js installed locally (for testing)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option 1: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `/` (root of your repository)
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

#### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### 3. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

| Key | Value (Description) |
|-----|---------------------|
| `VITE_API_BASE_URL` | Your Render backend URL (e.g., `https://aarambh-backend.onrender.com/api`) |
| `VITE_APP_ENV` | `production` |
| `VITE_DEBUG_MODE` | `false` |

### 4. Configure Project Settings

Make sure these settings are correct in your Vercel project:

- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`
- **Framework**: Vite

### 5. Deploy

Click "Deploy" and wait for the deployment to complete.

## Configuration Files

### vercel.json
This file configures how Vercel builds and deploys your application:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-render-app-url.onrender.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Variables
Set these in your Vercel project settings:

```env
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

## Post-Deployment Configuration

### 1. Update Backend CORS Settings
After deploying to Vercel, update your Render backend `ALLOWED_ORIGINS` environment variable to include your Vercel app URL:

```env
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### 2. Test the Deployment
1. Visit your Vercel app URL
2. Try to register a new user
3. Check if the frontend can communicate with the backend

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify the build command is correct

2. **API Connection Issues**:
   - Check `VITE_API_BASE_URL` environment variable
   - Verify backend CORS configuration
   - Ensure backend is deployed and running

3. **Environment Variables Not Working**:
   - Make sure variables are prefixed with `VITE_`
   - Check that variables are set in Vercel dashboard
   - Redeploy after changing environment variables

### Logs and Monitoring

- Check Vercel logs for build and runtime issues
- Monitor performance and errors in Vercel analytics
- Set up alerts for critical issues

## Updating Your Deployment

To update your deployed application:

1. Push changes to your Git repository
2. Vercel will automatically redeploy
3. Or manually trigger a deployment in Vercel dashboard

For manual deployment:
- Vercel: Go to your project dashboard and click "Redeploy"

## Security Considerations

1. Never commit sensitive information to version control
2. Use environment variables for API endpoints and secrets
3. Enable Vercel's security features
4. Regularly update dependencies to patch security vulnerabilities
5. Use HTTPS for all communications

## Custom Domain

To use a custom domain:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Wait for SSL certificate to be provisioned

## Environment-Specific Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Production
```env
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

## Useful Commands

```bash
# Test build locally
npm run build

# Preview production build
npm run preview

# Install Vercel CLI
npm install -g vercel

# Deploy with Vercel CLI
vercel

# Deploy to production with Vercel CLI
vercel --prod
```

## Support

If you encounter issues with deployment, check the documentation for:
- [Vercel Documentation](https://vercel.com/docs)
- [Aarambh Documentation](README.md)

For Aarambh-specific issues, please open an issue on the GitHub repository.