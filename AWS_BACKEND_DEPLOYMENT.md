# AWS Backend Deployment Guide

This guide will help you deploy the Aarambh LMS backend to AWS using Elastic Beanstalk.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured
3. Elastic Beanstalk CLI (EB CLI) installed
4. Node.js and npm installed
5. Git repository with your application code

## Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended)

Elastic Beanstalk is the simplest option for deploying your Node.js application to AWS.

#### Steps:

1. **Install EB CLI** (if not already installed):
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk**:
   ```bash
   cd server
   eb init
   ```
   - Select your region
   - Choose "aarambh-backend" as the application name
   - Select Node.js as the platform
   - Select the appropriate platform version (Node.js 18 or later)

3. **Create Environment and Deploy**:
   ```bash
   eb create production
   ```

4. **Set Environment Variables**:
   After deployment, you'll need to set your environment variables:
   ```bash
   eb setenv MONGODB_URI="your-mongodb-uri"
   eb setenv JWT_SECRET="your-jwt-secret"
   eb setenv GMAIL_USER="your-gmail-user"
   eb setenv GMAIL_APP_PASSWORD="your-app-password"
   eb setenv ALLOWED_ORIGINS="your-frontend-url"
   eb setenv API_SECRET_KEY="your-api-secret-key"
   eb setenv GEMINI_API_KEY="your-gemini-api-key"
   eb setenv GROQ_API_KEY="your-groq-api-key"
   ```

5. **Deploy Updates**:
   ```bash
   eb deploy
   ```

6. **Monitor Your Application**:
   ```bash
   eb status
   eb logs
   eb open
   ```

### Option 2: AWS ECS (Elastic Container Service)

For a more scalable container-based deployment:

1. **Create a Dockerfile** in your server directory:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 8080
   
   CMD ["npm", "start"]
   ```

2. **Create an ECS task definition** in the AWS console or using AWS CLI

3. **Set up an ECS service** with your task definition

4. **Configure environment variables** in the ECS task definition

### Option 3: AWS Lambda with API Gateway

For a serverless approach, you would need to refactor your application to work with AWS Lambda's event-driven model.

## Environment Variables

You'll need to configure the following environment variables in your AWS environment:

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | Secret for JWT token signing | your-super-secret-jwt-key |
| GMAIL_USER | Gmail address for sending emails | your-email@gmail.com |
| GMAIL_APP_PASSWORD | App password for Gmail | your-app-password |
| ALLOWED_ORIGINS | Comma-separated list of allowed origins | https://your-frontend-url.com |
| API_SECRET_KEY | Secret key for API security | your-secret-api-key |
| GEMINI_API_KEY | API key for Gemini AI service | your-gemini-api-key |
| GROQ_API_KEY | API key for Groq service | your-groq-api-key |

## Security Considerations

1. **Database Security**:
   - Ensure your MongoDB Atlas IP whitelist includes your AWS region IPs
   - Use strong authentication for database connections

2. **Environment Variables**:
   - Never hardcode sensitive information in your source code
   - Use AWS Systems Manager Parameter Store or AWS Secrets Manager for sensitive data

3. **CORS Configuration**:
   - Update your ALLOWED_ORIGINS to include your frontend URL when deployed

## Monitoring and Logging

1. **CloudWatch Logs**:
   - Elastic Beanstalk automatically sends logs to CloudWatch
   - Monitor application performance and errors

2. **Health Checks**:
   - The application includes `/health` and `/health-check` endpoints for monitoring

## Scaling

1. **Auto Scaling**:
   - Configure auto scaling policies in Elastic Beanstalk
   - Set CPU utilization triggers for scaling

2. **Database Scaling**:
   - Consider MongoDB Atlas's auto-scaling features for database performance

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**:
   - Verify all required environment variables are configured in the AWS console

2. **Database Connection Issues**:
   - Check MongoDB Atlas IP whitelist
   - Verify connection string and credentials

3. **CORS Errors**:
   - Ensure ALLOWED_ORIGINS includes your frontend URL

4. **Port Configuration**:
   - Elastic Beanstalk expects applications to listen on port 8080

### Checking Logs

1. **Elastic Beanstalk Logs**:
   ```bash
   eb logs
   ```

2. **CloudWatch Logs**:
   - Access through AWS Console > CloudWatch > Log Groups

## Updating Your Application

To update your deployed application:

1. Make changes to your code
2. Commit changes to your repository
3. Deploy using:
   ```bash
   eb deploy
   ```

## Cost Considerations

1. **Elastic Beanstalk**:
   - You only pay for the underlying EC2 instances, load balancers, and other resources
   - Free tier eligible

2. **Database**:
   - MongoDB Atlas pricing based on cluster tier

3. **Email Service**:
   - Gmail has sending limits; consider Amazon SES for production

## Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [EB CLI Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)