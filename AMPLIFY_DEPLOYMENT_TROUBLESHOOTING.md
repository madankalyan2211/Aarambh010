# AWS Amplify Deployment Troubleshooting Guide

## "Staging Not Found" Error

This error typically occurs when AWS Amplify cannot properly identify or create the staging environment during deployment. Here are several solutions to try:

### Solution 1: Use the Updated Deployment Package

1. Use the newly created `aarambh-frontend-deployment-v2.zip` file
2. This package contains an updated `amplify.yml` configuration that explicitly defines the application structure

### Solution 2: Manual Environment Creation

1. In the AWS Amplify Console, go to your app
2. Click on "Environments" in the left sidebar
3. Click "Manage environments"
4. Click "Create environment"
5. Enter "staging" as the environment name
6. Connect it to your repository branch or upload the ZIP file manually

### Solution 3: Repository-Based Deployment (Recommended)

Instead of uploading a ZIP file, connect your Git repository directly:

1. In AWS Amplify Console, select "Get started" or "New app"
2. Choose "GitHub", "GitLab", or "Bitbucket"
3. Connect your repository
4. Select the branch you want to deploy (e.g., `main`, `develop`)
5. Amplify will automatically create staging environments based on your application structure

## Environment Variables

Make sure to set the following environment variables in your Amplify app:

```
VITE_API_BASE_URL=https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/api
VITE_APP_ENV=production
VITE_APP_URL=https://your-app-id.amplifyapp.com
```

## Common Issues and Solutions

### 1. CORS Issues
If you encounter CORS errors, ensure that your frontend URL is added to the `ALLOWED_ORIGINS` in the backend `.env` file:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-app-id.amplifyapp.com
```

### 2. API Connection Issues
If the frontend cannot connect to the backend:
1. Verify the backend is running and accessible
2. Check that the `VITE_API_BASE_URL` is correct
3. Ensure the security groups and network settings allow connections

## Testing the Deployment

After successful deployment:
1. Visit your deployed frontend URL
2. Try to access the health endpoint: `https://your-app-id.amplifyapp.com/test-api.html`
3. Verify that API calls are working correctly

## Support

If you continue to experience issues:
1. Check the AWS Amplify documentation
2. Review the build logs in the Amplify Console
3. Contact AWS support if needed