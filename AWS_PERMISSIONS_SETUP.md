# AWS Permissions Setup Guide

This guide will help you set up the necessary permissions for deploying your Aarambh LMS application to AWS services.

## Creating an IAM User with Required Permissions

### Step 1: Sign in to AWS Console
1. Go to the [AWS Management Console](https://aws.amazon.com/console/)
2. Sign in with your AWS account credentials

### Step 2: Navigate to IAM Service
1. In the AWS Management Console, search for "IAM" in the services search bar
2. Click on "IAM" to open the IAM dashboard

### Step 3: Create a New User
1. In the left sidebar, click on "Users"
2. Click the "Add users" button
3. Enter a username (e.g., "aarambh-deploy-user")
4. Select "Access key - Programmatic access" and "Password - AWS Management Console access"
5. Click "Next"

### Step 4: Set Permissions
On the "Set permissions" page, you'll have several options. Choose one of the following approaches:

#### Option 1: Attach AWS Managed Policies (Recommended)
1. Select "Add user to group"
2. Click "Create group"
3. Enter a group name (e.g., "AarambhDeploymentGroup")
4. In the policy list, search for and select the following policies:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess`
   - `CloudWatchLogsFullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonEC2FullAccess` (Required for SSH key management)
5. Click "Create group"
6. Ensure your new group is selected
7. Click "Next"

#### Option 2: Direct Policy Attachment (Alternative)
If you prefer to attach policies directly to the user:
1. Select "Attach policies directly"
2. In the policy list, search for and select the following policies:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess`
   - `CloudWatchLogsFullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonEC2FullAccess` (Required for SSH key management)
3. Click "Next"

### Step 5: Review and Create
1. Review the user details and attached policies or groups
2. Click "Create user"

### Step 6: Save Credentials
1. Download the CSV file containing the access key ID and secret access key
2. Save these credentials securely as they will be used to configure the AWS CLI

## Configuring AWS CLI with Credentials

After creating the IAM user, configure the AWS CLI with the credentials:

```bash
aws configure
```

When prompted, enter:
- AWS Access Key ID: [Your access key]
- AWS Secret Access Key: [Your secret key]
- Default region name: [Your preferred region, e.g., us-east-1]
- Default output format: [json]

## Setting Up SSH Keys for Elastic Beanstalk (Optional)

If you plan to SSH into your Elastic Beanstalk instances for debugging, you'll need to set up SSH keys:

1. **Generate SSH key pair**:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh
   ./generate-eb-ssh-key.sh
   ```

2. **Or manually create SSH keys**:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "aarambh-eb-key" -f ~/.ssh/aws-eb
   chmod 600 ~/.ssh/aws-eb
   chmod 644 ~/.ssh/aws-eb.pub
   ```

3. **Initialize EB CLI and select your key when prompted**:
   ```bash
   cd server
   eb init
   ```

## Handling Permission Errors with Elastic Beanstalk

If you encounter permission errors like "NotAuthorizedError - Operation Denied" when using Elastic Beanstalk, refer to [AWS_EB_PERMISSIONS_FIX.md](AWS_EB_PERMISSIONS_FIX.md) for detailed instructions on updating your IAM permissions.

## Handling Token Errors

If you encounter token errors like "The security token included in the request is invalid", refer to [AWS_EB_TOKEN_ERROR_FIX.md](AWS_EB_TOKEN_ERROR_FIX.md) for detailed instructions on resolving credential issues.

## Verifying Permissions

To verify that your credentials are properly configured, run:

```bash
aws sts get-caller-identity
```

This should return information about your IAM user or role without any errors.

## Policy Details

### AWSElasticBeanstalkFullAccess
This policy provides full access to all Elastic Beanstalk actions, including:
- Creating and managing applications
- Creating and managing environments
- Managing application versions
- Configuring environment settings

### AmazonS3FullAccess
This policy provides full access to all S3 actions, including:
- Creating and managing buckets
- Uploading and downloading objects
- Managing bucket policies and permissions

### CloudWatchLogsFullAccess
This policy provides full access to CloudWatch Logs, including:
- Creating and managing log groups
- Viewing and filtering log events
- Managing log retention settings

### AmazonEC2ContainerRegistryFullAccess
This policy provides full access to Amazon ECR, including:
- Creating and managing repositories
- Pushing and pulling Docker images
- Managing repository policies

### AmazonEC2FullAccess
This policy provides full access to EC2 services, including:
- Managing key pairs (required for SSH access)
- Creating and managing instances
- Configuring security groups

## Security Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions required
2. **Use IAM Roles**: For applications running on AWS services, use IAM roles instead of access keys
3. **Rotate Credentials**: Regularly rotate access keys
4. **Enable MFA**: Enable multi-factor authentication for IAM users
5. **Monitor Activity**: Use AWS CloudTrail to monitor API activity

## Troubleshooting Common Issues

If you encounter the error "Operation Denied. The security token included in the request is invalid", refer to [AWS_CREDENTIALS_TROUBLESHOOTING.md](AWS_CREDENTIALS_TROUBLESHOOTING.md) for detailed troubleshooting steps.

If you encounter SSH key issues with Elastic Beanstalk, refer to [AWS_EB_SSH_KEY_SETUP.md](AWS_EB_SSH_KEY_SETUP.md) for detailed setup instructions.

If you encounter permission errors with Elastic Beanstalk, refer to [AWS_EB_PERMISSIONS_FIX.md](AWS_EB_PERMISSIONS_FIX.md) for detailed instructions.

If you encounter token errors with Elastic Beanstalk, refer to [AWS_EB_TOKEN_ERROR_FIX.md](AWS_EB_TOKEN_ERROR_FIX.md) for detailed instructions.

### Common Issues

1. **Insufficient Permissions**: If you encounter permission errors, verify that all required policies are attached
2. **Region Mismatch**: Ensure your AWS CLI is configured with the correct region
3. **Expired Credentials**: If using temporary credentials, ensure they haven't expired

### Checking Attached Policies

To check which policies are attached to your user or role:

```bash
aws iam list-attached-user-policies --user-name your-username
```

Or for roles:

```bash
aws iam list-attached-role-policies --role-name your-role-name
```

## Next Steps

After setting up permissions:

1. For Elastic Beanstalk deployment, follow the [AWS_BACKEND_DEPLOYMENT.md](AWS_BACKEND_DEPLOYMENT.md) guide
2. For frontend deployment to S3/CloudFront, refer to AWS documentation on static website hosting
3. For ECS deployment, use the Dockerfile provided in the server directory

## Additional Resources

- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)
- [AWS Elastic Beanstalk Security](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/security.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)