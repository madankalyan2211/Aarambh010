#!/bin/bash

# Aarambh LMS Deployment Script
# Deploys frontend to AWS Amplify and backend to AWS Elastic Beanstalk

set -e  # Exit on any error

echo "🚀 Starting Aarambh LMS Deployment Process"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo "------------------------"

# Check AWS CLI
if ! command_exists aws; then
    print_error "AWS CLI is not installed"
    echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
else
    print_status "AWS CLI is installed"
fi

# Check EB CLI
if ! command_exists eb; then
    print_error "EB CLI is not installed"
    echo "Please install EB CLI: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
    exit 1
else
    print_status "EB CLI is installed"
fi

# Check Amplify CLI
if ! command_exists amplify; then
    print_warning "Amplify CLI is not installed"
    echo "Installing Amplify CLI..."
    npm install -g @aws-amplify/cli
    print_status "Amplify CLI installed"
else
    print_status "Amplify CLI is installed"
fi

# Test AWS credentials
echo ""
echo "Testing AWS credentials..."
echo "--------------------------"

if aws sts get-caller-identity --profile default &>/dev/null; then
    print_status "Default AWS credentials are valid"
    DEFAULT_USER=$(aws sts get-caller-identity --profile default --query 'Arn' --output text)
    echo "  User: $DEFAULT_USER"
else
    print_error "Default AWS credentials are invalid"
    echo "Please run 'aws configure' to set up your credentials"
    exit 1
fi

echo ""
echo "Deployment Process:"
echo "==================="

# Build frontend
echo "1. Building frontend..."
echo "----------------------"
print_status "Building frontend application"
npm run build

if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Deploy backend to Elastic Beanstalk
echo ""
echo "2. Deploying backend to Elastic Beanstalk..."
echo "--------------------------------------------"

cd server

# Check if EB is initialized
if [ ! -d ".elasticbeanstalk" ]; then
    print_warning "EB not initialized. Initializing..."
    echo "Please run 'eb init' manually to set up your EB application"
    echo "Then run this script again"
    exit 1
else
    print_status "EB already initialized"
fi

# Check if environment exists
if eb status &>/dev/null; then
    print_status "Environment exists. Deploying..."
    eb deploy
else
    print_warning "Environment does not exist. Creating..."
    echo "Please run 'eb create production' manually to create your environment"
    echo "Then run this script again"
    exit 1
fi

if [ $? -eq 0 ]; then
    print_status "Backend deployed successfully"
else
    print_error "Backend deployment failed"
    exit 1
fi

cd ..

# Deploy frontend to Amplify
echo ""
echo "3. Deploying frontend to AWS Amplify..."
echo "---------------------------------------"

if amplify status &>/dev/null; then
    print_status "Amplify project initialized"
    echo "Publishing frontend..."
    amplify publish
else
    print_warning "Amplify not initialized. Initializing..."
    echo "Please run 'amplify init' manually to set up your Amplify project"
    echo "Then run this script again"
    exit 1
fi

if [ $? -eq 0 ]; then
    print_status "Frontend deployed successfully"
else
    print_error "Frontend deployment failed"
    exit 1
fi

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the API base URL in your frontend to point to your deployed backend"
echo "2. Configure environment variables in Amplify Console if needed"
echo "3. Set up custom domains if required"
echo ""
echo "Useful commands:"
echo "  eb status     - Check backend status"
echo "  eb logs       - View backend logs"
echo "  amplify status - Check frontend status"
echo "  amplify console - Open Amplify Console"