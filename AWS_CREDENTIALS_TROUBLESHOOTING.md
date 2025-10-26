# AWS Credentials Troubleshooting Guide

This guide will help you resolve the "Operation Denied. The security token included in the request is invalid" error.

## Common Causes

1. **Invalid or expired credentials**
2. **Incorrectly formatted credentials file**
3. **Missing credentials**
4. **Wrong AWS region configuration**
5. **Insufficient permissions**

## Solution Steps

### Step 1: Verify AWS Credentials Structure

AWS credentials should be stored in two separate files:

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

### Step 2: Obtain Valid AWS Credentials

If you don't have valid AWS credentials, follow the guide in [AWS_CREDENTIALS_OBTAINING.md](AWS_CREDENTIALS_OBTAINING.md) to create and obtain them.

### Step 3: Update Credentials File

Replace the placeholder values in `~/.aws/credentials` with your actual AWS credentials:

```bash
# Edit the credentials file
nano ~/.aws/credentials
```

Or use the AWS CLI configuration command:
```bash
aws configure
```

### Step 4: Verify Credentials

Test your credentials with the following command:
```bash
aws sts get-caller-identity
```

This should return information about your AWS user without any errors.

### Step 5: Test Elastic Beanstalk Permissions

Test Elastic Beanstalk access:
```bash
eb list
```

If this is the first time using EB CLI, you may need to initialize:
```bash
cd server
eb init
```

## Alternative Solutions

### Solution 1: Use Environment Variables

Set your AWS credentials as environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=us-east-1
```

### Solution 2: Use AWS CLI Configuration

Configure using the AWS CLI:
```bash
aws configure
```

When prompted, enter:
- AWS Access Key ID: [Your actual access key]
- AWS Secret Access Key: [Your actual secret key]
- Default region name: us-east-1
- Default output format: json

### Solution 3: Use Temporary Credentials

If you're using temporary credentials, also set the session token:
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_SESSION_TOKEN=your_session_token
```

## Common Mistakes to Avoid

1. **Putting credentials in the config file**: Credentials should only be in the credentials file
2. **Using invalid characters**: Ensure there are no extra spaces or special characters
3. **Expired credentials**: Rotate credentials regularly
4. **Insufficient permissions**: Ensure your user has all required policies attached

## Verifying File Permissions

Ensure your AWS configuration files have the correct permissions:
```bash
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

## Testing Your Setup

After updating your credentials:

1. Test basic AWS access:
   ```bash
   aws sts get-caller-identity
   ```

2. Test S3 access:
   ```bash
   aws s3 ls
   ```

3. Test Elastic Beanstalk access:
   ```bash
   eb list
   ```

## If Issues Persist

1. **Check for typos**: Ensure there are no typos in your access key ID
2. **Verify key status**: Check that your access key is active in the AWS IAM console
3. **Check region**: Ensure you're using the correct AWS region
4. **Review permissions**: Verify that your user has the required policies attached

## Additional Resources

- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)