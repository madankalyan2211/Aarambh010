# Vercel Frontend to Render Backend Connection Guide

This document explains how your Vercel frontend connects to your Render backend service.

## Current Connection Setup

Your frontend and backend are connected through the following configuration:

### Environment Variables
In your frontend [.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production) file:
```env
VITE_API_BASE_URL=https://aarambh01-m6cx.onrender.com
```

This environment variable tells your frontend where to send API requests.

### Vercel Proxy Configuration
In your [vercel.json](file:///Users/madanthambisetty/Downloads/Aarambh/vercel.json) file:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://aarambh01-m6cx.onrender.com"
    },
    {
      "source": "/(.*)",
      "destination": "/build/index.html"
    }
  ]
}
```

The rewrites configuration does two things:
1. Routes `/api/*` requests to your Render backend
2. Handles client-side routing by redirecting all other requests to your React app

## How the Connection Works

1. When your frontend makes an API call to `/api/users`, Vercel intercepts this request
2. The rewrite rule sends the request to `https://aarambh01-m6cx.onrender.com`
3. Your Render backend processes the request and returns the response
4. Vercel forwards the response back to the frontend

## Verification Steps

To verify the connection is working:

1. Visit your Vercel deployment URL
2. Try logging in or accessing any feature that makes API calls
3. Check the browser's Network tab to see if API requests are being made to your Render backend
4. Confirm that responses are being received successfully

## Troubleshooting Connection Issues

If you're experiencing connection problems:

1. **Check your Render backend URL**: Make sure the destination URL in [vercel.json](file:///Users/madanthambisetty/Downloads/Aarambh/vercel.json) matches your actual Render deployment URL

2. **Verify environment variables**: Ensure `VITE_API_BASE_URL` in your Vercel environment settings matches your Render backend URL

3. **Check CORS configuration**: Your Render backend should allow requests from your Vercel frontend domain

4. **Verify Render service status**: Ensure your Render backend is running and not in sleep mode

## Updating Connection URLs

If you need to update your Render backend URL:

1. Update the destination URL in [vercel.json](file:///Users/madanthambisetty/Downloads/Aarambh/vercel.json)
2. Update `VITE_API_BASE_URL` in your [.env.production](file:///Users/madanthambisetty/Downloads/Aarambh/.env.production) file
3. Redeploy your Vercel frontend

Your Vercel frontend is successfully connected to your Render backend through these configurations.