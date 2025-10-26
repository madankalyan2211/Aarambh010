# Complete Netlify Deployment Guide for Aarambh LMS

This guide will help you deploy your Aarambh LMS frontend to Netlify and connect it to your already deployed Render backend.

## Prerequisites

1. A [Netlify](https://netlify.com) account
2. The [aarambh-netlify-deployment.zip](aarambh-netlify-deployment.zip) file (already created)
3. Your backend deployed at https://aarambh01-1.onrender.com

## Deployment Steps

### Option 1: Deploy Using the Build Package (Recommended)

1. **Sign in to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in or create an account

2. **Deploy the Site**
   - Drag and drop the [aarambh-netlify-deployment.zip](aarambh-netlify-deployment.zip) file onto the Netlify dashboard
   - Or click "New site from Git" if you prefer to deploy from a repository

3. **Configure Site Settings**
   - The build settings are already configured in [netlify.toml](netlify.toml):
     - Build command: `npm run build`
     - Publish directory: `build`
   - Since you're uploading a pre-built package, these settings won't be used

4. **Set Environment Variables**
   Even though you've built with the correct configuration, it's good practice to set these in Netlify as well:
   
   Go to **Site settings** → **Build & deploy** → **Environment** and add:
   ```
   VITE_API_BASE_URL=https://aarambh01-1.onrender.com/api
   VITE_APP_ENV=production
   ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify will deploy your site and provide a URL

### Option 2: Deploy from Git Repository

1. **Push Code to Git**
   - Push your code to GitHub/GitLab/Bitbucket

2. **Create New Site in Netlify**
   - Click **New site from Git**
   - Connect to your Git provider
   - Select your repository

3. **Configure Build Settings**
   - Branch to deploy: `main` (or your default branch)
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Add Environment Variables**
   Go to **Site settings** → **Build & deploy** → **Environment** and add:
   ```
   VITE_API_BASE_URL=https://aarambh01-1.onrender.com/api
   VITE_APP_ENV=production
   ```

5. **Deploy**
   - Click "Deploy site"

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the instructions to configure DNS records

## Verification

After deployment:

1. **Visit Your Site**
   - Netlify will provide a URL like `https://your-site-name.netlify.app`
   - Your site should load and connect to the backend

2. **Test Key Functionality**
   - User registration and login
   - Course browsing
   - Assignment submission
   - Discussion forums

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check for any errors in the Console tab
   - Check the Network tab to verify API requests to your Render backend

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check that your Render backend is running
   - Ensure CORS is configured properly (should already be set up)

2. **Site Not Loading**
   - Check the build logs in Netlify
   - Verify all dependencies are correctly installed
   - Ensure the build command is `npm run build`

3. **Environment Variables Not Working**
   - Make sure variables are prefixed with `VITE_`
   - Check that they're set in Netlify dashboard
   - Rebuild and redeploy if you change environment variables

### Checking Connection to Backend

You can verify the connection by:

1. Opening your deployed site
2. Opening Developer Tools (F12)
3. Going to the Network tab
4. Performing an action that makes an API call (like trying to log in)
5. Checking if requests are being made to `https://aarambh01-1.onrender.com/api`

## Monitoring

### Netlify Features

1. **Analytics**
   - Netlify provides built-in analytics
   - Track page views, bandwidth usage, etc.

2. **Form Handling**
   - Netlify can handle form submissions
   - Check the Forms section in your site dashboard

3. **Deployment History**
   - View all deployments and roll back if needed
   - Access via Deploys section

### Performance Optimization

1. **Asset Optimization**
   - Netlify automatically optimizes images
   - Assets are served via CDN

2. **Redirects**
   - Configured in [netlify.toml](netlify.toml) for SPA routing

## Next Steps

1. **Test All Features**
   - Registration, login, and authentication
   - Course enrollment and viewing
   - Assignment submission
   - Discussion forums
   - Messaging system

2. **Configure Custom Domain**
   - If you haven't already

3. **Set Up Monitoring**
   - Configure alerts for downtime
   - Monitor usage analytics

4. **Share with Users**
   - Your Aarambh LMS is ready for production use!

## Support

If you encounter issues:

1. Check Netlify build logs
2. Verify Render backend status
3. Confirm environment variables are set correctly
4. Check browser console for errors

Your Aarambh LMS frontend is now ready to be deployed to Netlify and will connect to your Render backend!