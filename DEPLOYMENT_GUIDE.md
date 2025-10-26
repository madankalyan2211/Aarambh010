# Aarambh LMS Deployment Guide

This guide provides instructions for deploying the Aarambh Learning Management System to Render (backend) and AWS (frontend).

## Prerequisites

1. Node.js >= 18.0.0
2. npm or yarn
3. Git
4. AWS CLI (for AWS deployment)
5. Render account (for backend deployment)

## Backend Deployment to Render

### 1. Prepare Environment Variables

Update the `server/.env.render` file with your actual configuration values:

```bash
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# Email Configuration (Gmail)
GMAIL_USER=your_gmail_address_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Firebase Admin SDK Configuration
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY=your_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here
FIREBASE_CLIENT_ID=your_firebase_client_id_here
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url_here
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" -> "Web Service"
3. Connect your GitHub repository
4. Set the root directory to `server`
5. Configure the following settings:
   - Name: `aarambh-backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or choose a paid plan for production)
6. Add environment variables from `.env.render`
7. Click "Create Web Service"

### 3. Post-Deployment Configuration

After deployment, update your MongoDB Atlas IP whitelist to include Render's IP addresses.

## Frontend Deployment to AWS

### 1. Configure Environment Variables

Update the `.env` file with your production configuration:

```bash
# Firebase Web SDK Configuration (for frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here

# Backend API Configuration
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### 2. Deploy Using AWS CLI Script

Run the deployment script:

```bash
# Make the script executable
chmod +x deploy-to-aws.sh

# Run the deployment
./deploy-to-aws.sh --bucket your-bucket-name --region us-east-1
```

### 3. Manual AWS Deployment Steps

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-bucket-name --region us-east-1
   ```

2. **Configure Static Website Hosting**:
   ```bash
   aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
   ```

3. **Build the Application**:
   ```bash
   npm run build
   ```

4. **Upload Files**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

5. **Set Bucket Policy**:
   Create a `bucket-policy.json` file:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::your-bucket-name/*"
           }
       ]
   }
   ```
   
   Apply the policy:
   ```bash
   aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
   ```

6. **Configure CORS** (optional):
   Create a `cors.json` file:
   ```json
   {
       "CORSRules": [
           {
               "AllowedHeaders": ["*"],
               "AllowedMethods": ["GET", "HEAD"],
               "AllowedOrigins": ["*"],
               "MaxAgeSeconds": 3000
           }
       ]
   }
   ```
   
   Apply CORS configuration:
   ```bash
   aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
   ```

### 4. Optional: Create CloudFront Distribution

For HTTPS support and better performance, create a CloudFront distribution:

```bash
aws cloudfront create-distribution \
    --origin-domain-name your-bucket-name.s3.amazonaws.com \
    --default-root-object index.html
```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT token generation | Yes |
| `GMAIL_USER` | Gmail address for sending emails | Yes |
| `GMAIL_APP_PASSWORD` | Gmail app password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `FIREBASE_*` | Firebase Admin SDK credentials | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | Yes |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend CORS configuration allows requests from your frontend domain.

2. **MongoDB Connection Issues**: Verify your MongoDB Atlas IP whitelist includes your deployment environment IPs.

3. **Firebase Authentication Issues**: Check that all Firebase configuration variables are correctly set.

4. **Email Sending Issues**: Ensure your Gmail app password is correctly configured.

### Logs and Monitoring

- Render: Check logs in the Render dashboard
- AWS: Check CloudWatch logs for S3 and CloudFront
- Application: Enable debug logging by setting `DEBUG=*` environment variable

## Security Considerations

1. Never commit sensitive credentials to version control
2. Use environment variables for all secrets
3. Rotate JWT secrets regularly
4. Use strong, unique passwords for all services
5. Enable two-factor authentication where possible
6. Regularly update dependencies to patch security vulnerabilities

## Scaling Considerations

1. **Render**: Upgrade to a paid plan for better performance and reliability
2. **AWS**: Consider using CloudFront for global content delivery
3. **MongoDB**: Use a dedicated cluster for production workloads
4. **Email**: Consider using a dedicated email service like SendGrid or AWS SES for production

## Maintenance

1. Regularly backup your MongoDB database
2. Monitor application logs for errors
3. Update dependencies regularly
4. Review and rotate API keys and secrets periodically
5. Monitor usage and costs on Render and AWS