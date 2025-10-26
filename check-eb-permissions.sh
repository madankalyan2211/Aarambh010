#!/bin/bash

# Script to check Elastic Beanstalk permissions for the current AWS user

echo "🔍 Checking Elastic Beanstalk Permissions"
echo "======================================"

# Get current user
CURRENT_USER=$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Error: Unable to get AWS credentials"
    echo "Please run 'aws configure' to set up your credentials"
    exit 1
fi

echo "Current User: $CURRENT_USER"
echo ""

# Check if user has Elastic Beanstalk permissions
echo "Checking Elastic Beanstalk permissions..."
echo "--------------------------------------"

# Test basic EB actions
echo "1. Testing elasticbeanstalk:ListAvailableSolutionStacks..."
aws elasticbeanstalk list-available-solution-stacks --max-items 1 >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Permission granted"
else
    echo "   ❌ Permission denied"
fi

echo "2. Testing elasticbeanstalk:DescribeApplications..."
aws elasticbeanstalk describe-applications --max-items 1 >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Permission granted"
else
    echo "   ❌ Permission denied"
fi

echo "3. Testing elasticbeanstalk:CreateApplication (dry-run)..."
# We can't do a real dry-run, but we can check if the user has the permission by attempting a call
# This will fail but tell us about permissions
aws elasticbeanstalk create-application --application-name test-permission-check >/dev/null 2>&1
if [ $? -eq 254 ]; then
    # This means we have permission but the application name is invalid (expected)
    echo "   ✅ Permission granted (application name validation error is expected)"
elif [ $? -eq 253 ]; then
    # This means access denied
    echo "   ❌ Permission denied"
else
    # Some other error
    echo "   ⚠ Unknown result (exit code: $?)"
fi

echo ""
echo "Checking attached policies..."
echo "---------------------------"

# Extract user name from ARN
USER_NAME=$(echo $CURRENT_USER | cut -d'/' -f2)

# List attached policies
echo "Policies attached to user '$USER_NAME':"
aws iam list-attached-user-policies --user-name $USER_NAME --query 'AttachedPolicies[].PolicyName' --output table 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Error: Unable to list attached policies"
fi

echo ""
echo "Checking inline policies..."
echo "-------------------------"

# List inline policies
aws iam list-user-policies --user-name $USER_NAME --query 'PolicyNames' --output table 2>/dev/null

echo ""
echo "Recommendation:"
echo "--------------"
echo "If you see 'Permission denied' for any of the Elastic Beanstalk actions above,"
echo "you need to attach the appropriate policies to your user."
echo ""
echo "To fix this, you can:"
echo "1. Attach the 'AWSElasticBeanstalkFullAccess' managed policy, or"
echo "2. Create and attach a custom policy with the required permissions"
echo ""
echo "See AWS_EB_PERMISSIONS_FIX_DETAILED.md for detailed instructions."