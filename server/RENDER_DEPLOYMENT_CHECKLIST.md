# Render Deployment Checklist for Aarambh Backend

This checklist ensures you don't miss any steps when deploying the Aarambh backend to Render.

## ✅ Pre-Deployment Checklist

### MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account (if needed)
- [ ] Create cluster or use existing one
- [ ] Get MongoDB connection string
- [ ] Configure IP whitelist for Render:
  - [ ] Option A: Add `0.0.0.0/0` (for testing)
  - [ ] Option B: Add Render static IPs (for production)

### Gmail Configuration
- [ ] Enable 2-Factor Authentication on Gmail account
- [ ] Generate App Password for "Mail"
- [ ] Save App Password securely

### Render Account
- [ ] Create Render account (if needed)
- [ ] Verify email address

### Git Repository
- [ ] Push latest code to GitHub/GitLab/Bitbucket
- [ ] Ensure all changes are committed

## ✅ Deployment Process

### Create Web Service
- [ ] Log into Render dashboard
- [ ] Click **New** → **Web Service**
- [ ] Connect Git repository
- [ ] Configure service settings:
  - [ ] Name: `aarambh-backend`
  - [ ] Environment: `Node`
  - [ ] Build command: `npm install`
  - [ ] Start command: `npm start`
  - [ ] Plan: Select appropriate plan (Free/Paid)

### Environment Variables
Set all required environment variables in Render:

- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `JWT_SECRET` - Secret key for JWT tokens
- [ ] `GMAIL_USER` - Your Gmail address
- [ ] `GMAIL_APP_PASSWORD` - Your Gmail App Password
- [ ] `ALLOWED_ORIGINS` - Comma-separated frontend URLs
- [ ] `API_SECRET_KEY` - API secret key
- [ ] `GEMINI_API_KEY` - Google Gemini API key (optional)
- [ ] `GROQ_API_KEY` - Groq API key (optional)

### Advanced Settings (Optional)
- [ ] Custom domain (if needed)
- [ ] Health check path: `/health`
- [ ] Auto-deploy: Enable/disable as needed

## ✅ Post-Deployment Verification

### Initial Deployment
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete
- [ ] Note the service URL: `https://your-service.onrender.com`

### Health Checks
- [ ] Visit root endpoint: `https://your-service.onrender.com`
- [ ] Check health endpoint: `https://your-service.onrender.com/health`
- [ ] Verify JSON response with status information

### Functionality Tests
- [ ] Test user registration endpoint
- [ ] Test user login endpoint
- [ ] Test OTP email sending
- [ ] Test course endpoints
- [ ] Test WebSocket connections (if applicable)

### Monitoring
- [ ] Check Render dashboard for any errors
- [ ] Monitor logs for warnings or errors
- [ ] Verify MongoDB connection in logs
- [ ] Check email service functionality

## ✅ Troubleshooting Checklist

If deployment fails:

- [ ] Check build logs for dependency issues
- [ ] Verify all environment variables are set
- [ ] Confirm MongoDB URI is correct
- [ ] Check MongoDB IP whitelist configuration
- [ ] Verify Gmail App Password is correct
- [ ] Ensure ALLOWED_ORIGINS includes your frontend URL

If service is running but not responding:

- [ ] Check if port is correctly configured
- [ ] Verify CORS settings
- [ ] Check MongoDB connection status
- [ ] Review application logs for errors
- [ ] Test endpoints with curl or Postman

## ✅ Production Considerations

For production deployment:

- [ ] Upgrade to paid Render plan for always-on instances
- [ ] Use static IPs or private endpoints for MongoDB
- [ ] Configure custom domain with SSL
- [ ] Set up monitoring and alerting
- [ ] Implement backup strategies
- [ ] Review security settings
- [ ] Optimize performance settings

## ✅ Documentation

- [ ] Save service URL for frontend configuration
- [ ] Document environment variables and their values
- [ ] Record any custom configurations
- [ ] Update team documentation with deployment details

## 🚀 Deployment Complete

Once all checklist items are completed and verified, your Aarambh backend will be successfully deployed to Render and ready to serve your frontend application!