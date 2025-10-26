# AWS Amplify Deployment Guide

This guide will help you deploy the Aarambh LMS application to AWS Amplify.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured
3. Node.js and npm installed
4. Git repository with your application code

## Deployment Steps

### 1. Connect Your Repository to AWS Amplify

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" and select "Host web app"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize AWS Amplify to access your repository
5. Select the repository for your Aarambh application
6. Select the branch you want to deploy (typically `main` or `master`)

### 2. Configure Build Settings

AWS Amplify should automatically detect your app as a React application. However, you can manually configure the build settings:

- **Build and test settings**:
  ```
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm ci
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: build
      files:
        - '**/*'
    cache:
      paths:
        - node_modules/**/*
  ```

### 3. Environment Variables

You may need to configure environment variables in the Amplify Console:

1. In the Amplify Console, go to your app
2. Click on "Environment variables" in the sidebar
3. Add any required environment variables:
   - `REACT_APP_API_URL` (if you have a custom API URL)
   - Any other frontend environment variables

### 4. Advanced Settings (Optional)

If you need custom domain, redirects, or other advanced settings:

1. Click on "Rewrites and redirects" in the sidebar
2. Add the following redirect rule for Single Page Applications:
   ```
   Source address: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
   Target address: /index.html
   Type: 200 (Rewrite)
   ```

### 5. Deploy

1. Click "Save and deploy"
2. AWS Amplify will start building and deploying your application
3. The deployment process typically takes a few minutes
4. Once complete, you'll receive a URL for your deployed application

## Backend API Configuration

Since your backend is separate from your frontend, you'll need to ensure your frontend can communicate with your backend API. You have a few options:

### Option 1: Use Your Existing Backend
If you're already hosting your backend elsewhere (e.g., Render), you can continue to use it by setting the API URL in your environment variables.

### Option 2: Deploy Backend to AWS
If you want to deploy your backend to AWS as well, you can use AWS Elastic Beanstalk, EC2, or container services like ECS or EKS.

## Troubleshooting

### Common Issues

1. **Build failures**: Check the build logs in the Amplify Console for specific error messages
2. **Environment variables not working**: Ensure you've added them in the Amplify Console under "Environment variables"
3. **API calls failing**: Verify that your backend URL is correctly configured and that CORS is properly set up

### Checking Build Logs

1. Go to your app in the Amplify Console
2. Click on the deployment in progress or the most recent deployment
3. Click on "Build" to see detailed logs

## Updating Your Application

To update your deployed application:

1. Push changes to your connected Git repository
2. AWS Amplify will automatically detect the changes and start a new deployment
3. You can also manually trigger a deployment from the Amplify Console

## Custom Domain

To use a custom domain:

1. In the Amplify Console, go to your app
2. Click on "Domain management" in the sidebar
3. Click "Add domain"
4. Enter your domain name and follow the instructions to configure DNS

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS Amplify Console User Guide](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)