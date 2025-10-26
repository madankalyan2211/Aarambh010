#!/bin/bash

# Deployment script for Aarambh backend to AWS Elastic Beanstalk

echo "🚀 Starting Aarambh backend deployment to AWS Elastic Beanstalk..."

# Check if AWS EB CLI is installed
if ! command -v eb &> /dev/null
then
    echo "❌ AWS EB CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
    exit 1
fi

# Check if we're in the server directory
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r ../aarambh-backend-deployment.zip . -x "*.git*" "*node_modules/*" "*.env*" "*dist/*" "*build/*" "*.zip" "*test*" "*logs*" "*tmp*"

# Deploy to Elastic Beanstalk
echo "🚀 Deploying to Elastic Beanstalk..."
eb deploy

echo "✅ Deployment completed!"
echo "📝 To check the status of your deployment, run: eb status"