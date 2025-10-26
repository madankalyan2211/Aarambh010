#!/bin/bash

# Script to diagnose and fix AWS credentials issues

echo "===== AWS Credentials Diagnosis Tool ====="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "ERROR: AWS CLI is not installed or not in PATH"
    echo "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
fi

echo "✓ AWS CLI is installed"
echo ""

# Check current AWS configuration
echo "Current AWS configuration:"
echo "-------------------------"
aws configure list 2>/dev/null || echo "Unable to retrieve AWS configuration"
echo ""

# Check if credentials files exist
echo "Checking credentials files:"
echo "--------------------------"
if [ -f ~/.aws/credentials ]; then
    echo "✓ ~/.aws/credentials exists"
    echo "File permissions: $(ls -l ~/.aws/credentials | awk '{print $1}')"
else
    echo "✗ ~/.aws/credentials does not exist"
fi

if [ -f ~/.aws/config ]; then
    echo "✓ ~/.aws/config exists"
    echo "File permissions: $(ls -l ~/.aws/config | awk '{print $1}')"
else
    echo "✗ ~/.aws/config does not exist"
fi
echo ""

# Check credentials file structure
echo "Checking credentials file structure:"
echo "-----------------------------------"
if [ -f ~/.aws/credentials ]; then
    echo "Contents of ~/.aws/credentials:"
    grep -v "^$" ~/.aws/credentials | grep -v "aws_secret_access_key" || echo "File is empty or contains only whitespace"
    echo ""
fi

# Test AWS credentials
echo "Testing AWS credentials:"
echo "-----------------------"
if aws sts get-caller-identity &> /dev/null; then
    echo "✓ AWS credentials are valid"
    echo "Current user: $(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null)"
else
    echo "✗ AWS credentials are invalid or expired"
    echo ""
    echo "Recommended actions:"
    echo "1. Regenerate your AWS credentials in the IAM console"
    echo "2. Run 'aws configure' to update your credentials"
    echo "3. Check that your credentials files have correct format"
    echo "4. Ensure proper file permissions (600 for credentials file)"
fi
echo ""

# Check EB CLI
echo "Checking EB CLI:"
echo "---------------"
if command -v eb &> /dev/null; then
    echo "✓ EB CLI is installed"
    echo "Version: $(eb --version)"
else
    echo "✗ EB CLI is not installed"
    echo "Please install EB CLI: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html"
fi
echo ""

echo "========================================="
echo ""
echo "If you're still experiencing issues:"
echo "1. Regenerate your AWS credentials"
echo "2. Run 'aws configure' with new credentials"
echo "3. Set proper file permissions:"
echo "   chmod 600 ~/.aws/credentials"
echo "   chmod 600 ~/.aws/config"
echo "4. Try 'eb create production' again"