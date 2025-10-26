# Frontend Deployment Guide

This guide will help you deploy the Aarambh LMS frontend to AWS Amplify.

## Prerequisites

1. AWS Account
2. Completed backend deployment to AWS Elastic Beanstalk

## Deployment Steps

### Option 1: Deploy using AWS Amplify Console (Recommended)

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" and select "Host web app"
3. Choose your deployment method:
   - **Connect to a Git repository**: If you have your code in GitHub, GitLab, or Bitbucket
   - **Drag and drop**: Upload the `aarambh-frontend-deployment.zip` file
4. If using Git:
   - Connect your repository
   - Select the branch to deploy (usually `main` or `master`)
5. If uploading ZIP file:
   - Drag and drop the `aarambh-frontend-deployment.zip` file
6. Configure build settings:
   - Build command: `npm run build`
   - Base directory: `build`
7. Add environment variables:
   ```
   VITE_API_BASE_URL=https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/api
   VITE_APP_ENV=production
   VITE_APP_URL=https://your-app-id.amplifyapp.com (provided by Amplify)
   ```
8. Click "Save and deploy"

### Option 2: Manual Deployment

1. Extract the deployment package:
   ```bash
   unzip aarambh-frontend-deployment.zip
   ```
2. Upload the contents of the `build` directory to any static hosting service (S3, Netlify, Vercel, etc.)

## Environment Variables

The following environment variables are required for production:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/api` | Backend API URL |
| `VITE_APP_ENV` | `production` | Application environment |
| `VITE_APP_URL` | `https://your-app-id.amplifyapp.com` | Frontend application URL |

## Testing the Deployment

After deployment, you can test the connection between frontend and backend:

1. Visit your deployed frontend URL
2. Try to access the health endpoint: `https://your-app-id.amplifyapp.com/test-api.html`
3. Verify that API calls are working correctly

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure that your frontend URL is added to the `ALLOWED_ORIGINS` in the backend `.env` file:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-app-id.amplifyapp.com
```

### API Connection Issues
If the frontend cannot connect to the backend:
1. Verify the backend is running and accessible
2. Check that the `VITE_API_BASE_URL` is correct
3. Ensure the security groups and network settings allow connections

## Post-Deployment

After successful deployment:
1. Update any documentation with the new frontend URL
2. Test all major functionality (login, course enrollment, assignments, etc.)
3. Monitor the application for any errors or issues