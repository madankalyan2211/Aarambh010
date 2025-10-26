#!/bin/bash

# Frontend deployment script for Aarambh LMS

echo "🚀 Starting Aarambh frontend deployment preparation..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root project directory"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Create deployment package
echo "📦 Creating deployment package..."
zip -r aarambh-frontend-deployment.zip build amplify.yml static.json

echo "✅ Deployment package created: aarambh-frontend-deployment.zip"

echo ""
echo "📋 To deploy to AWS Amplify:"
echo "1. Go to the AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' and select 'Host web app'"
echo "3. Connect your repository or upload the aarambh-frontend-deployment.zip file"
echo "4. Set the following environment variables in Amplify:"
echo "   - VITE_API_BASE_URL: https://aarambh-production.eba-hmkpyyve.us-east-1.elasticbeanstalk.com/api"
echo "   - VITE_APP_ENV: production"
echo "   - VITE_APP_URL: https://your-app-id.amplifyapp.com (will be provided by Amplify)"
echo "5. Set build settings:"
echo "   - Build command: npm run build"
echo "   - Base directory: build"
echo ""
echo "✅ Frontend deployment package is ready!"