# AWS Deployment: Next Steps After Configuration

This guide outlines the steps you should take after configuring AWS for deploying your Aarambh LMS application.

## Prerequisites Check

Before proceeding, ensure you have:

1. ✅ AWS CLI installed and configured
2. ✅ EB CLI installed
3. ✅ Valid AWS credentials with proper permissions
4. ✅ SSH keys generated (if needed for EB)
5. ✅ Required IAM policies attached to your user/group

## Deployment Options

Your Aarambh application consists of two main components:
1. **Frontend** (React/Vite application)
2. **Backend** (Node.js/Express API)

You can deploy these components separately using different AWS services.

## Option 1: Deploy Frontend to AWS Amplify

### Step 1: Prepare for Amplify Deployment

1. Ensure your frontend code is ready:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh
   npm install
   ```

2. Test locally:
   ```bash
   npm run dev
   ```

### Step 2: Deploy to AWS Amplify

1. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" and select "Host web app"
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Authorize AWS Amplify to access your repository
5. Select the repository for your Aarambh frontend
6. Select the branch you want to deploy (typically `main` or `master`)
7. Configure build settings (should auto-detect):
   - Build command: `npm run build`
   - Output directory: `build`
8. Click "Save and deploy"

### Step 3: Configure Environment Variables (if needed)

1. In the Amplify Console, go to your app
2. Click on "Environment variables" in the sidebar
3. Add any required environment variables:
   - `VITE_API_BASE_URL` (if you have a custom API URL)

## Option 2: Deploy Backend to Elastic Beanstalk

### Step 1: Prepare Backend for Deployment

1. Ensure your backend code is ready:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh/server
   npm install
   ```

2. Test locally:
   ```bash
   npm start
   ```

### Step 2: Initialize EB CLI

1. Initialize EB CLI in your server directory:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh/server
   eb init
   ```

2. When prompted:
   - Select your region (us-east-1)
   - Select your application (or create a new one)
   - Select your platform (Node.js)
   - Select or create SSH key (optional)

### Step 3: Create EB Environment

1. Create your production environment:
   ```bash
   eb create production
   ```

2. Wait for the environment to be created (this may take several minutes)

### Step 4: Set Environment Variables

1. Set required environment variables:
   ```bash
   eb setenv NODE_ENV=production
   eb setenv PORT=8080
   # Add other required environment variables from your .env file
   ```

### Step 5: Deploy Application

1. Deploy your application:
   ```bash
   eb deploy
   ```

### Step 6: Monitor Deployment

1. Check deployment status:
   ```bash
   eb status
   ```

2. View logs if needed:
   ```bash
   eb logs
   ```

## Option 3: Deploy Backend to ECS (Containerized)

### Step 1: Build and Push Docker Image

1. Ensure you have Docker installed and running
2. Build your Docker image:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh/server
   docker build -t aarambh-backend .
   ```

3. Tag and push to Amazon ECR:
   ```bash
   # Create ECR repository (if not exists)
   aws ecr create-repository --repository-name aarambh-backend
   
   # Get ECR login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   # Tag and push image
   docker tag aarambh-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aarambh-backend:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aarambh-backend:latest
   ```

### Step 2: Create ECS Task and Service

1. Create ECS task definition
2. Create ECS service
3. Configure load balancer
4. Set up auto-scaling (optional)

## Post-Deployment Steps

### 1. Update Frontend API Configuration

After deploying your backend, update your frontend to point to the new backend URL:

1. In your frontend code, update the API base URL
2. If using Amplify, you can set environment variables:
   - `VITE_API_BASE_URL` = `https://your-eb-environment-url`

### 2. Test Your Deployment

1. Visit your frontend URL (from Amplify)
2. Test backend endpoints:
   ```bash
   curl https://your-eb-environment-url/health
   ```

### 3. Configure Custom Domains (Optional)

1. For frontend (Amplify):
   - In Amplify Console, go to "Domain management"
   - Click "Add domain"
   - Follow instructions to configure DNS

2. For backend (EB):
   - Configure Route 53 or your DNS provider
   - Set up SSL certificate with ACM

### 4. Set Up Monitoring and Alerts

1. Configure CloudWatch for:
   - Application logs
   - Performance metrics
   - Error alerts

2. Set up notifications for:
   - Deployment failures
   - High error rates
   - Performance degradation

## Troubleshooting Common Issues

### Issue 1: Environment Variables Not Set

Ensure all required environment variables are set in your EB environment:
```bash
eb setenv MONGODB_URI="your-mongodb-uri"
eb setenv JWT_SECRET="your-jwt-secret"
# Add other required variables
```

### Issue 2: CORS Errors

Update your backend CORS configuration to allow your frontend domain:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-amplify-domain.amplifyapp.com'
  // Add your custom domain if configured
];
```

### Issue 3: Database Connection Issues

1. Ensure your MongoDB Atlas IP whitelist includes AWS IPs
2. Verify your connection string is correct
3. Check that your credentials are valid

## Security Best Practices

1. **Environment Variables**: Never hardcode sensitive information
2. **Database Security**: Use strong authentication and IP whitelisting
3. **HTTPS**: Ensure all communications are encrypted
4. **Regular Updates**: Keep dependencies up to date
5. **Monitoring**: Set up logging and alerting

## Cost Management

1. **Elastic Beanstalk**: Monitor instance hours and data transfer
2. **Amplify**: Track build minutes and data transfer
3. **Database**: Monitor MongoDB Atlas usage
4. **Storage**: Track S3 usage if used for file storage

## Next Steps

1. Deploy your frontend to AWS Amplify
2. Deploy your backend to Elastic Beanstalk
3. Test the integration between frontend and backend
4. Configure custom domains
5. Set up monitoring and alerts
6. Document your deployment process

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [EB CLI Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)