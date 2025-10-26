#!/bin/bash

# Script to deploy Aarambh LMS to AWS

echo "===== Aarambh LMS AWS Deployment Script ====="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo "------------------------"

if ! command_exists aws; then
    echo "❌ AWS CLI is not installed"
    echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
else
    echo "✓ AWS CLI is installed"
fi

if ! command_exists eb; then
    echo "❌ EB CLI is not installed"
    echo "Please install EB CLI: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
    exit 1
else
    echo "✓ EB CLI is installed"
fi

# Test AWS credentials
echo ""
echo "Testing AWS credentials..."
echo "--------------------------"
if aws sts get-caller-identity --profile default &>/dev/null; then
    echo "✓ Default AWS credentials are valid"
    DEFAULT_USER=$(aws sts get-caller-identity --profile default --query 'Arn' --output text)
    echo "  User: $DEFAULT_USER"
else
    echo "❌ Default AWS credentials are invalid"
    echo "Please run 'aws configure' to set up your credentials"
    exit 1
fi

if aws sts get-caller-identity --profile eb-cli &>/dev/null; then
    echo "✓ EB CLI AWS credentials are valid"
    EB_USER=$(aws sts get-caller-identity --profile eb-cli --query 'Arn' --output text)
    echo "  User: $EB_USER"
else
    echo "❌ EB CLI AWS credentials are invalid"
    echo "Please run 'aws configure --profile eb-cli' to set up your credentials"
    exit 1
fi

echo ""
echo "Deployment Options:"
echo "-------------------"
echo "1. Deploy frontend to AWS Amplify (manual process)"
echo "2. Deploy backend to Elastic Beanstalk"
echo "3. Deploy backend to ECS (Docker)"
echo "4. Exit"
echo ""

read -p "Select an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Deploying frontend to AWS Amplify:"
        echo "----------------------------------"
        echo "1. Go to the AWS Amplify Console: https://console.aws.amazon.com/amplify/"
        echo "2. Click 'New app' and select 'Host web app'"
        echo "3. Connect your Git repository"
        echo "4. Select your repository and branch"
        echo "5. Configure build settings:"
        echo "   - Build command: npm run build"
        echo "   - Output directory: build"
        echo "6. Click 'Save and deploy'"
        echo ""
        echo "Note: This process requires manual steps in the AWS Console."
        ;;
    2)
        echo ""
        echo "Deploying backend to Elastic Beanstalk:"
        echo "--------------------------------------"
        
        # Check if we're in the server directory
        if [ ! -f "server.js" ] && [ ! -f "package.json" ]; then
            echo "Changing to server directory..."
            cd server || { echo "❌ Could not find server directory"; exit 1; }
        fi
        
        # Initialize EB CLI if needed
        if [ ! -d ".elasticbeanstalk" ]; then
            echo "Initializing EB CLI..."
            eb init
        else
            echo "EB CLI already initialized"
        fi
        
        # Check if environment exists
        if eb status &>/dev/null; then
            echo "Environment already exists. Deploying..."
            eb deploy
        else
            echo "Creating new environment..."
            eb create production
        fi
        
        echo ""
        echo "Setting environment variables..."
        eb setenv NODE_ENV=production
        eb setenv PORT=8080
        
        echo ""
        echo "Deployment complete!"
        echo "Check status with: eb status"
        echo "View logs with: eb logs"
        ;;
    3)
        echo ""
        echo "Deploying backend to ECS (Docker):"
        echo "---------------------------------"
        echo "1. Ensure Docker is installed and running"
        echo "2. Build Docker image:"
        echo "   cd server"
        echo "   docker build -t aarambh-backend ."
        echo "3. Tag and push to Amazon ECR:"
        echo "   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"
        echo "   docker tag aarambh-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aarambh-backend:latest"
        echo "   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/aarambh-backend:latest"
        echo "4. Create ECS task definition and service in AWS Console"
        ;;
    4)
        echo "Exiting deployment script."
        exit 0
        ;;
    *)
        echo "Invalid option. Exiting."
        exit 1
        ;;
esac

echo ""
echo "For detailed instructions, refer to AWS_DEPLOYMENT_NEXT_STEPS.md"