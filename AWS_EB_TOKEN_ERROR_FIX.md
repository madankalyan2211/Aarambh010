# AWS Elastic Beanstalk Token Error Fix Guide

This guide will help you resolve the "NotAuthorizedError - Operation Denied. The security token included in the request is invalid" error when using Elastic Beanstalk.

## Understanding the Issue

This error typically occurs due to one of the following reasons:
1. Invalid or expired AWS credentials
2. Incorrectly formatted credentials file
3. Misconfigured AWS CLI profile
4. Using temporary credentials that have expired

## Solution Steps

### Step 1: Verify AWS Credentials

First, check if your AWS credentials are properly configured:

```bash
# Check if AWS CLI can identify your user
aws sts get-caller-identity
```

If this command fails, your credentials are not properly configured.

### Step 2: Reconfigure AWS Credentials

If the previous command failed, reconfigure your credentials:

```bash
# Reconfigure AWS CLI
aws configure
```

When prompted, enter:
- AWS Access Key ID: [Your actual access key]
- AWS Secret Access Key: [Your actual secret key]
- Default region name: us-east-1
- Default output format: json

### Step 3: Check Credentials File Structure

Ensure your credentials files are properly structured:

#### ~/.aws/config
```
[default]
region = us-east-1
output = json

[profile eb-cli]
region = us-east-1
output = json
```

#### ~/.aws/credentials
```
[default]
aws_access_key_id = YOUR_ACTUAL_ACCESS_KEY_ID
aws_secret_access_key = YOUR_ACTUAL_SECRET_ACCESS_KEY

[eb-cli]
aws_access_key_id = YOUR_ACTUAL_ACCESS_KEY_ID
aws_secret_access_key = YOUR_ACTUAL_SECRET_ACCESS_KEY
```

### Step 4: Set Proper File Permissions

Ensure your AWS configuration files have the correct permissions:

```bash
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### Step 5: Test with Specific Profile

Try using the EB CLI with a specific profile:

```bash
# Use the eb-cli profile
eb list --profile eb-cli
```

### Step 6: Regenerate AWS Credentials

If the above steps don't work, you may need to regenerate your AWS credentials:

1. Go to AWS IAM Console
2. Navigate to "Users"
3. Select your user
4. Go to "Security credentials" tab
5. In "Access keys" section, click "Create access key"
6. Download the CSV file with new credentials
7. Reconfigure AWS CLI with new credentials:
   ```bash
   aws configure
   ```

### Step 7: Check for Temporary Credentials

If you're using temporary credentials (e.g., from AWS SSO or assumed roles), they may have expired. In this case:

1. Obtain new temporary credentials
2. Set them as environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your_temp_access_key_id
   export AWS_SECRET_ACCESS_KEY=your_temp_secret_access_key
   export AWS_SESSION_TOKEN=your_session_token
   ```

### Step 8: Verify IAM User Permissions

Ensure your IAM user has all required permissions:

1. `AWSElasticBeanstalkFullAccess`
2. `AmazonS3FullAccess`
3. `CloudWatchLogsFullAccess`
4. `AmazonEC2ContainerRegistryFullAccess`
5. `AmazonEC2FullAccess`

## Alternative Solutions

### Solution 1: Use Environment Variables

Set your AWS credentials as environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=us-east-1
```

Then try creating the environment:
```bash
cd server
eb create production
```

### Solution 2: Specify Profile Explicitly

Use a specific AWS profile:

```bash
cd server
eb create production --profile default
```

### Solution 3: Recreate EB Configuration

Delete existing EB configuration and reinitialize:

```bash
cd server
rm -rf .elasticbeanstalk
eb init
eb create production
```

## Troubleshooting Commands

### Check Current Configuration

```bash
# Check AWS CLI configuration
aws configure list

# Check EB CLI profile
eb list --verbose

# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_DEFAULT_REGION
```

### Validate Credentials

```bash
# Test basic AWS access
aws sts get-caller-identity

# Test S3 access
aws s3 ls

# Test Elastic Beanstalk access
aws elasticbeanstalk describe-applications
```

## Common Mistakes to Avoid

1. **Putting credentials in config file**: Credentials should only be in the credentials file
2. **Using invalid characters**: Ensure there are no extra spaces or special characters
3. **Expired credentials**: Rotate credentials regularly
4. **Wrong region**: Ensure you're using the correct AWS region
5. **Insufficient permissions**: Ensure your user has all required policies attached

## If Issues Persist

1. **Check for typos**: Ensure there are no typos in your access key ID
2. **Verify key status**: Check that your access key is active in the AWS IAM console
3. **Check region**: Ensure you're using the correct AWS region
4. **Review permissions**: Verify that your user has the required policies attached
5. **Contact AWS Support**: If all else fails, contact AWS Support for assistance

## Additional Resources

- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)