#!/bin/bash

# Deployment Environment Checker for Aarambh LMS
# Verifies all required tools and configurations are in place

echo "🔍 Aarambh LMS Deployment Environment Checker"
echo "============================================"

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

echo ""
echo "Checking Required Tools:"
echo "-----------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION installed"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js (v18 or higher)"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm $NPM_VERSION installed"
else
    print_warning "npm is not installed"
fi

# Check AWS CLI
if command_exists aws; then
    AWS_VERSION=$(aws --version 2>&1)
    print_status "AWS CLI installed ($AWS_VERSION)"
    
    # Test AWS credentials
    echo ""
    echo "Checking AWS Credentials:"
    echo "------------------------"
    if aws sts get-caller-identity --profile default &>/dev/null; then
        print_status "Default AWS credentials are valid"
        DEFAULT_USER=$(aws sts get-caller-identity --profile default --query 'Arn' --output text)
        echo "  User: $DEFAULT_USER"
    else
        print_warning "Default AWS credentials not found or invalid"
        echo "  Run 'aws configure' to set up your credentials"
    fi
else
    print_error "AWS CLI is not installed"
    echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
fi

# Check EB CLI
if command_exists eb; then
    EB_VERSION=$(eb --version 2>&1)
    print_status "EB CLI installed ($EB_VERSION)"
else
    print_warning "EB CLI is not installed"
    echo "Please install EB CLI: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
fi

# Check Amplify CLI
if command_exists amplify; then
    AMPLIFY_VERSION=$(amplify --version 2>&1)
    print_status "Amplify CLI installed ($AMPLIFY_VERSION)"
else
    print_warning "Amplify CLI is not installed"
    echo "Install with: npm install -g @aws-amplify/cli"
fi

echo ""
echo "Checking Project Structure:"
echo "--------------------------"

# Check if we're in the right directory
if [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
    print_status "Frontend project files found"
else
    print_error "Frontend project files not found"
    echo "Please run this script from the project root directory"
fi

if [ -d "server" ] && [ -f "server/package.json" ] && [ -f "server/server.js" ]; then
    print_status "Backend project files found"
else
    print_error "Backend project files not found"
    echo "Expected server directory with package.json and server.js"
fi

# Check configuration files
echo ""
echo "Checking Configuration Files:"
echo "----------------------------"

if [ -f "amplify.yml" ]; then
    print_status "amplify.yml found"
else
    print_warning "amplify.yml not found"
fi

if [ -f "static.json" ]; then
    print_status "static.json found"
else
    print_warning "static.json not found"
fi

echo ""
echo "Checking Environment Variables:"
echo "------------------------------"

# Check for .env files
if [ -f ".env" ]; then
    print_status ".env file found"
elif [ -f ".env.example" ]; then
    print_status ".env.example found (rename to .env and configure)"
else
    print_warning "No .env file found"
fi

if [ -d "server" ]; then
    cd server
    if [ -f ".env" ]; then
        print_status "server/.env file found"
    elif [ -f ".env.example" ]; then
        print_status "server/.env.example found (rename to .env and configure)"
    else
        print_warning "No server/.env file found"
    fi
    cd ..
fi

echo ""
echo "Deployment Environment Check Complete!"
echo "====================================="

echo ""
echo "Next steps:"
echo "1. If any tools are missing, install them as indicated above"
echo "2. If credentials are missing, configure them with 'aws configure'"
echo "3. Run './quick-deploy.sh' to see deployment commands"
echo "4. Run './deploy-frontend-backend.sh' to start deployment"