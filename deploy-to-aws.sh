#!/bin/bash

# AWS Deployment Script for Aarambh LMS Frontend

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS Deployment for Aarambh LMS Frontend${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS. Please configure your AWS credentials.${NC}"
    exit 1
fi

# Default values
BUCKET_NAME="aarambh-lms-frontend-$(date +%s)"
REGION="us-east-1"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--bucket)
            BUCKET_NAME="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -b, --bucket NAME    S3 bucket name (default: aarambh-lms-frontend-TIMESTAMP)"
            echo "  -r, --region REGION  AWS region (default: us-east-1)"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}📦 Building frontend application...${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build the application
npm run build

echo -e "${YELLOW}☁️  Deploying to AWS S3 bucket: $BUCKET_NAME${NC}"

# Create S3 bucket
echo -e "${YELLOW}Creating S3 bucket...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
echo -e "${YELLOW}Configuring bucket for static website hosting...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload build files
echo -e "${YELLOW}Uploading build files...${NC}"
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set bucket policy for public read access
echo -e "${YELLOW}Setting bucket policy...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Clean up temporary policy file
rm bucket-policy.json

# Enable CORS
echo -e "${YELLOW}Configuring CORS...${NC}"
cat > cors.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors.json

# Clean up temporary CORS file
rm cors.json

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com${NC}"

# Optional: Create CloudFront distribution
echo -e "${YELLOW}Do you want to create a CloudFront distribution for HTTPS support? (y/N)${NC}"
read -r CREATE_CLOUDFRONT

if [[ $CREATE_CLOUDFRONT =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating CloudFront distribution...${NC}"
    
    # Create CloudFront distribution
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --origin-domain-name $BUCKET_NAME.s3.amazonaws.com \
        --default-root-object index.html \
        --query 'Distribution.Id' \
        --output text)
    
    echo -e "${GREEN}CloudFront Distribution ID: $DISTRIBUTION_ID${NC}"
    echo -e "${YELLOW}It may take up to 15 minutes for the CloudFront distribution to be ready.${NC}"
fi

echo -e "${GREEN}🎉 AWS deployment finished!${NC}"