# Netlify Deployment Guide

This guide will help you deploy the Aarambh LMS frontend to Netlify.

## Prerequisites

1. A [Netlify](https://netlify.com) account
2. The project code (this repository)
3. A backend API server deployed and accessible via HTTPS

## Deployment Steps

### 1. Configure Environment Variables

Before deploying, you need to set up your environment variables in Netlify:

1. Go to your Netlify dashboard
2. Select your site or create a new one
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Add the following environment variables:

```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_APP_ENV=production
VITE_APP_URL=https://your-app-name.netlify.app
```

### 2. Deploy to Netlify

You can deploy in two ways:

#### Option A: Deploy from Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Netlify, click **New site from Git**
3. Select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Click **Deploy site**

#### Option B: Deploy manually

1. Run `npm run build` locally
2. Zip the `build` folder
3. In Netlify, go to **Sites** → **Drop your site here** and upload the zip file

### 3. Configure Redirects

The `netlify.toml` file in this repository already includes the necessary redirects for a Single Page Application (SPA). This ensures that all routes are redirected to `index.html` so that client-side routing works correctly.

### 4. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Add your custom domain
3. Follow the instructions to configure DNS records

## Environment Variables

Here are the key environment variables you need to configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | The base URL of your backend API | `https://your-backend.onrender.com/api` |
| `VITE_APP_ENV` | Application environment | `production` |
| `VITE_APP_URL` | The URL of your deployed app | `https://your-app.netlify.app` |

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Check that all dependencies are correctly installed:
   ```bash
   npm install
   ```

2. Try building locally first:
   ```bash
   npm run build
   ```

### API Connection Issues

If the frontend can't connect to the backend:

1. Verify that `VITE_API_BASE_URL` is set correctly
2. Ensure your backend allows requests from your Netlify domain (CORS)
3. Check that your backend is deployed and accessible

### Routing Issues

If navigation doesn't work properly:

1. Verify that the redirect rules in `netlify.toml` are correct
2. Make sure all routes are handled by your frontend router

## Additional Notes

- The application uses client-side routing, so all non-file routes must redirect to `index.html`
- The build output is in the `build` directory
- The site is optimized for production with minification and compression