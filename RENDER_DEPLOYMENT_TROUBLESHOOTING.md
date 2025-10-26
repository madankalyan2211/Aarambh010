# Render Deployment Troubleshooting Guide

This guide will help you troubleshoot common issues with deploying the Aarambh LMS backend to Render.

## Common Issues and Solutions

### 1. 502 Bad Gateway Error

This is the most common error you're experiencing. It typically means:

#### Causes:
1. **Missing Environment Variables** - Critical variables like [MONGODB_URI](file:///Users/madanthambisetty/Downloads/Aarambh/server/generate-ai-course-content.js#L4-L4), [JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L15-L15) are not set in Render dashboard
2. **Port Issues** - Application not binding to the correct port provided by Render
3. **Database Connection** - MongoDB not accessible from Render
4. **Application Crashes** - Server crashing on startup

#### Solutions:

1. **Set Environment Variables in Render Dashboard**:
   - Go to your Render service dashboard
   - Navigate to "Environment" tab
   - Add these required variables:
     - [MONGODB_URI](file:///Users/madanthambisetty/Downloads/Aarambh/server/generate-ai-course-content.js#L4-L4) - Your MongoDB connection string
     - [JWT_SECRET](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L15-L15) - Your JWT secret key
     - [GMAIL_USER](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L3-L3) - Your Gmail address
     - [GMAIL_APP_PASSWORD](file:///Users/madanthambisetty/Downloads/Aarambh/server/config/email.config.js#L4-L4) - Your Gmail app password
     - [ALLOWED_ORIGINS](file:///Users/madanthambisetty/Downloads/Aarambh/server/server.js#L27-L27) - Your frontend URL (e.g., `https://your-app.vercel.app`)
     - [API_SECRET_KEY](file:///Users/madanthambisetty/Downloads/Aarambh/server/services/ai.service.js#L3-L3) - Your API secret key

2. **Verify Port Configuration**:
   - Your application should use `process.env.PORT` provided by Render
   - Check that server.js correctly binds to this port

3. **Check MongoDB Atlas Configuration**:
   - Ensure your MongoDB Atlas cluster allows connections from Render IPs
   - Add `0.0.0.0/0` to your IP whitelist temporarily for testing
   - Verify your connection string is correct

### 2. Application Crashes on Startup

#### Check Logs:
```bash
# In Render dashboard, check the logs for error messages
# Look for:
# - Missing environment variables
# - Database connection errors
# - Port binding issues
# - Syntax errors
```

#### Common Fixes:
1. **Missing Dependencies**: Ensure all dependencies are in package.json
2. **Syntax Errors**: Check for any recent code changes that might have introduced errors
3. **Environment Variables**: Verify all required variables are set

### 3. Database Connection Issues

#### Symptoms:
- Application starts but health check shows MongoDB disconnected
- Authentication endpoints fail

#### Solutions:
1. **MongoDB Atlas IP Whitelist**:
   - In MongoDB Atlas dashboard, go to Network Access
   - Add your Render service IP or `0.0.0.0/0` for testing
   - Wait a few minutes for changes to propagate

2. **Connection String**:
   - Verify your [MONGODB_URI](file:///Users/madanthambisetty/Downloads/Aarambh/server/generate-ai-course-content.js#L4-L4) is correct
   - Test locally with the same URI

### 4. Email Service Issues

#### Symptoms:
- OTP emails not being sent
- Welcome emails failing

#### Solutions:
1. **Gmail App Password**:
   - Ensure you're using an App Password, not your regular Gmail password
   - Generate a new App Password if needed

2. **Gmail Security Settings**:
   - Ensure 2-factor authentication is enabled
   - Check that less secure app access is not required (App Passwords are preferred)

## Testing Your Configuration

### 1. Local Testing:
```bash
# Test your configuration locally
cd server
npm run test-render
```

### 2. Environment Variable Verification:
```bash
# Check that all required variables are set
echo $MONGODB_URI
echo $JWT_SECRET
echo $GMAIL_USER
```

## Render Dashboard Configuration

### Environment Variables Setup:
1. Go to your Render service
2. Click "Environment" tab
3. Add these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GMAIL_USER=your_gmail_address
   GMAIL_APP_PASSWORD=your_app_password
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   API_SECRET_KEY=your_api_secret
   ```

### Advanced Settings:
1. **Health Check Path**: Set to `/health`
2. **Start Command**: `npm start`
3. **Build Command**: `npm install`

## Debugging Steps

### 1. Check Render Logs:
1. Go to your Render service dashboard
2. Click "Logs" tab
3. Look for error messages during build and runtime

### 2. Test Endpoint Locally:
```bash
# Test your server locally
cd server
npm start
# Then visit http://localhost:3001/health
```

### 3. Verify MongoDB Connection:
```bash
# Test MongoDB connection locally
cd server
npm run test-db
```

## Contact Support

If you continue to experience issues:

1. **Render Support**: 
   - Visit https://render.com/help
   - Check their documentation at https://render.com/docs

2. **MongoDB Atlas Support**:
   - Visit https://www.mongodb.com/cloud/atlas
   - Check their documentation at https://docs.atlas.mongodb.com/

## Additional Resources

- [Render YAML Configuration](server/render.yaml)
- [Server Configuration](server/server.js)
- [Database Configuration](server/config/database.js)
- [Environment Variables](server/.env)