# Aarambh LMS Quick Start Guide

## 🚀 Accessing Your Application

1. **Frontend**: Visit [https://aarambh-frontend.vercel.app](https://aarambh-frontend.vercel.app)
2. **Backend API**: Available at [https://aarambh01-m6cx.onrender.com](https://aarambh01-m6cx.onrender.com)

## 🔧 First-Time Setup

### 1. Database Access
To access the MongoDB database:
1. Log in to your MongoDB Atlas account
2. Add your current IP address to the cluster's IP whitelist
3. The database will automatically connect when the backend starts

### 2. Environment Variables
All sensitive environment variables are stored in the platform dashboards:
- **Vercel**: Check your project's Environment Variables settings
- **Render**: Check your service's Environment Variables settings

## 🧪 Testing the Application

1. Visit the frontend URL
2. Try registering a new user account
3. Check the browser's Network tab to verify API calls are successful
4. Confirm you receive a response from the backend

## 📚 Key Documentation

- [DEPLOYMENT_STATUS.md](file:///Users/madanthambisetty/Downloads/Aarambh/DEPLOYMENT_STATUS.md) - Complete deployment status
- [CONNECTION_SETUP_SUMMARY.md](file:///Users/madanthambisetty/Downloads/Aarambh/CONNECTION_SETUP_SUMMARY.md) - Connection details
- [VERCEL_RENDER_CONNECTION.md](file:///Users/madanthambisetty/Downloads/Aarambh/VERCEL_RENDER_CONNECTION.md) - Vercel-Render connection guide
- [FINAL_DEPLOYMENT_CONFIRMATION.md](file:///Users/madanthambisetty/Downloads/Aarambh/FINAL_DEPLOYMENT_CONFIRMATION.md) - Final confirmation

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure your IP is whitelisted in MongoDB Atlas
2. **API Errors**: Check Render backend logs for issues
3. **Frontend Issues**: Check Vercel deployment logs
4. **CORS Errors**: Verify ALLOWED_ORIGINS includes your frontend domain

### Health Checks:
- Backend: [https://aarambh01-m6cx.onrender.com/health](https://aarambh01-m6cx.onrender.com/health)
- This should return: `{"success":true,"message":"Server is running","mongodb":"connected"}`

## 📝 Next Steps

1. Test all application features
2. Configure email service credentials in environment variables
3. Add additional users as needed
4. Monitor application usage and performance

Your Aarambh LMS is ready to use!