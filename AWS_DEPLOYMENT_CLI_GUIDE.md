# AWS Deployment Guide: Frontend to Amplify & Backend to Elastic Beanstalk (CLI)

This guide provides step-by-step instructions for deploying the Aarambh LMS application using AWS CLI tools.

## Prerequisites

Before starting the deployment process, ensure you have the following:

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. EB CLI (Elastic Beanstalk Command Line Interface) installed
4. Node.js (v18 or higher) installed
5. Git installed

### Installing Required Tools

If you don't have the required tools installed:

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Install EB CLI
pip install awsebcli --upgrade --user

# Install Amplify CLI
npm install -g @aws-amplify/cli
```

### Configure AWS Credentials

```bash
# Configure default AWS credentials
aws configure

# Configure EB CLI specific credentials (optional but recommended)
aws configure --profile eb-cli
```

## Backend Deployment to AWS Elastic Beanstalk

### 1. Prepare the Backend

Navigate to the server directory:

```bash
cd server
```

### 2. Initialize Elastic Beanstalk

Initialize your EB application:

```bash
eb init
```

When prompted, select:
- Region: Choose the region closest to your users (e.g., `us-east-1`)
- Application: Create a new application (e.g., `aarambh-backend`)
- Platform: Node.js
- Platform version: Latest (or v18+ to match your Node.js version)
- SSH: Set up SSH access if you want to connect to instances (optional)

### 3. Create and Deploy Environment

Create your environment and deploy the application:

```bash
# Create environment and deploy
eb create production

# If environment already exists, just deploy
eb deploy
```

### 4. Set Environment Variables

Configure necessary environment variables:

```bash
eb setenv NODE_ENV=production
eb setenv PORT=8080
# Add any other required environment variables from your .env file
```

### 5. Check Deployment Status

```bash
# Check status
eb status

# View logs
eb logs

# Open application in browser
eb open
```

## Frontend Deployment to AWS Amplify

### Option 1: Using Amplify CLI (Recommended for CI/CD)

#### 1. Initialize Amplify Project

From the root directory:

```bash
amplify init
```

When prompted, select:
- Project name: `aarambh-frontend`
- Environment: `production`
- Default editor: Your preferred editor
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `build`
- Build command: `npm run build`
- Start command: `npm run dev`

#### 2. Add Hosting

```bash
amplify add hosting
```

Select:
- Environment: `PROD` (for production)
- Manual deployment

#### 3. Publish the Application

```bash
amplify publish
```

### Option 2: Manual Deployment to Amplify Console

This is the approach outlined in the existing deployment script and is often preferred for frontend applications.

#### 1. Build the Frontend

From the root directory:

```bash
npm run build
```

#### 2. Deploy via Amplify Console

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" and select "Host web app"
3. Connect your Git repository (GitHub, GitLab, Bitbucket) or upload your code
4. Select your repository and branch
5. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `build`
6. Click "Save and deploy"

### Option 3: Using AWS CLI for Manual Deployment

If you prefer to use AWS CLI directly:

#### 1. Create Amplify App

```bash
aws amplify create-app \
    --name aarambh-frontend \
    --repository https://github.com/your-username/aarambh.git \
    --platform WEB
```

#### 2. Create Backend Environment

```bash
aws amplify create-backend-environment \
    --app-id <your-app-id> \
    --environment-name production
```

#### 3. Create Deployment

```bash
aws amplify create-deployment \
    --app-id <your-app-id> \
    --branch-name main
```

## Configuration Files

### Amplify Configuration (amplify.yml)

The project already includes an [amplify.yml](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/amplify.yml) file with the correct configuration:

```yaml
version: 1
applications:
  - frontend:
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
    appRoot: .
```

### Static Configuration (static.json)

The project includes a [static.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/static.json) file for routing:

```json
{
  "Routes": [
    {
      "Source": "/api/*",
      "Target": "https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/api/:splat",
      "Status": "200"
    },
    {
      "Source": "/<*>",
      "Target": "/index.html",
      "Status": "200"
    }
  ],
  "ErrorPages": [
    {
      "ErrorCode": "404",
      "Path": "/index.html"
    }
  ]
}
```

Update the API target URL to match your deployed backend URL.

## Environment Variables

### Backend Environment Variables

Set these in Elastic Beanstalk:

```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  MONGODB_URI=your_mongodb_connection_string \
  JWT_SECRET=your_jwt_secret \
  GMAIL_USER=your_gmail_user \
  GMAIL_APP_PASSWORD=your_app_password
```

### Frontend Environment Variables

For Amplify, set these in the Amplify Console under App settings > Environment variables:

```
VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com/api
VITE_APP_ENV=production
VITE_APP_URL=https://your-app-name.amplifyapp.com
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your AWS user has the necessary permissions for Elastic Beanstalk and Amplify.

2. **Build Failures**: Check that all dependencies are correctly specified in package.json files.

3. **Environment Variables**: Ensure all required environment variables are set in both frontend and backend.

4. **CORS Issues**: Verify that your backend CORS configuration allows requests from your frontend domain.

### Useful Commands

```bash
# Check EB environment health
eb health

# SSH into EB instance (if SSH was configured)
eb ssh

# Get environment information
eb printenv

# Restart application
eb restart
```

## Post-Deployment Steps

1. Update the API base URL in the frontend [static.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/static.json) to point to your deployed backend
2. Configure custom domain (if needed) in both Amplify and Elastic Beanstalk
3. Set up SSL certificates through AWS Certificate Manager
4. Configure monitoring with AWS CloudWatch
5. Set up CI/CD pipelines for automatic deployments

## Useful Documentation

- [AWS_EB_PERMISSIONS_FIX.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_EB_PERMISSIONS_FIX.md)
- [AWS_PERMISSIONS_SETUP.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_PERMISSIONS_SETUP.md)
- [AMPLIFY_DEPLOYMENT_TROUBLESHOOTING.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AMPLIFY_DEPLOYMENT_TROUBLESHOOTING.md)
- [AWS_DEPLOYMENT_NEXT_STEPS.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_DEPLOYMENT_NEXT_STEPS.md)