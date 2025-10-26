# Aarambh LMS Deployment Summary (CLI Method)

This document summarizes the deployment process for the Aarambh LMS application using AWS CLI tools.

## Deployment Architecture

```
┌─────────────────────┐    API Calls    ┌──────────────────────────┐
│   Frontend (Web)    │◄────────────────►│   Backend (API Server)   │
│   AWS Amplify       │                 │   AWS Elastic Beanstalk  │
│                     │                 │                          │
│  React Application  │                 │   Node.js/Express API    │
└─────────────────────┘                 └──────────────────────────┘
```

## Deployment Components

### 1. Frontend (AWS Amplify)

- **Technology**: React/Vite application
- **Build Directory**: `build/`
- **Configuration Files**:
  - [amplify.yml](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/amplify.yml) - Build configuration
  - [static.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/static.json) - Routing configuration
  - [vite.config.ts](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/vite.config.ts) - Development server configuration

### 2. Backend (AWS Elastic Beanstalk)

- **Technology**: Node.js/Express API server
- **Entry Point**: [server.js](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/server/server.js)
- **Configuration Files**:
  - [server/package.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/server/package.json) - Dependencies and scripts
  - Environment variables in EB configuration

## Deployment Scripts

### 1. Environment Checker
**File**: [check-deployment-env.sh](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/check-deployment-env.sh)
Verifies all required tools and configurations are in place.

### 2. Quick Deployment Guide
**File**: [quick-deploy.sh](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/quick-deploy.sh)
Provides step-by-step deployment commands.

### 3. Automated Deployment Script
**File**: [deploy-frontend-backend.sh](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/deploy-frontend-backend.sh)
Automates the deployment process (requires manual initialization steps).

## Deployment Steps

### Prerequisites Check
Run the environment checker:
```bash
./check-deployment-env.sh
```

### Backend Deployment (Elastic Beanstalk)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Initialize EB (if not already done):
   ```bash
   eb init
   ```

3. Create environment (if not already done):
   ```bash
   eb create production
   ```

4. Set environment variables:
   ```bash
   eb setenv NODE_ENV=production PORT=8080
   # Add any other required environment variables
   ```

5. Deploy the application:
   ```bash
   eb deploy
   ```

6. Check status:
   ```bash
   eb status
   ```

### Frontend Deployment (Amplify)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Initialize Amplify (if not already done):
   ```bash
   amplify init
   ```

3. Add hosting:
   ```bash
   amplify add hosting
   ```

4. Publish the application:
   ```bash
   amplify publish
   ```

## Configuration Updates

After deployment, you may need to update configuration files:

1. Update the API base URL in [static.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/static.json) to point to your deployed backend URL.

2. Configure environment variables in the Amplify Console:
   - `VITE_API_BASE_URL` - Your EB backend URL
   - `VITE_APP_ENV` - production
   - `VITE_APP_URL` - Your Amplify frontend URL

## Useful Commands

### Elastic Beanstalk
```bash
# Check environment status
eb status

# View application logs
eb logs

# Open application in browser
eb open

# Check environment health
eb health

# Restart application
eb restart

# SSH into instance (if configured)
eb ssh
```

### Amplify
```bash
# Check Amplify status
amplify status

# Open Amplify Console
amplify console

# List Amplify environments
amplify env list

# Add new Amplify category
amplify add <category>
```

### AWS CLI
```bash
# Check AWS credentials
aws sts get-caller-identity

# List EB applications
aws elasticbeanstalk describe-applications

# List Amplify apps
aws amplify list-apps
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your AWS user has appropriate permissions for EB and Amplify.

2. **Build Failures**: Check that all dependencies are correctly specified in package.json files.

3. **Environment Variables**: Ensure all required environment variables are set.

4. **CORS Issues**: Verify that your backend CORS configuration allows requests from your frontend domain.

### Helpful Documentation

- [AWS_DEPLOYMENT_CLI_GUIDE.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_DEPLOYMENT_CLI_GUIDE.md) - Complete deployment guide
- [AWS_EB_PERMISSIONS_FIX.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_EB_PERMISSIONS_FIX.md) - EB permissions troubleshooting
- [AMPLIFY_DEPLOYMENT_TROUBLESHOOTING.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AMPLIFY_DEPLOYMENT_TROUBLESHOOTING.md) - Amplify deployment troubleshooting

## Next Steps

1. Run the environment checker to verify all tools are installed
2. Follow the quick deployment guide to deploy your application
3. Update configuration files with deployed URLs
4. Set up custom domains and SSL certificates if needed
5. Configure monitoring and alerting