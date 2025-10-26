# How to Obtain AWS Access Key ID and Secret Access Key

This guide will walk you through the process of obtaining your AWS credentials.

## Prerequisites

1. An AWS account (if you don't have one, create it at [aws.amazon.com](https://aws.amazon.com))
2. Access to the AWS Management Console with administrative privileges

## Steps to Create AWS Access Keys

### Step 1: Sign in to AWS Management Console

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Sign In to the Console"
3. Enter your AWS account credentials

### Step 2: Navigate to IAM Service

1. In the AWS Management Console, use the search bar to find "IAM"
2. Click on "IAM" to open the Identity and Access Management service

### Step 3: Access Users Section

1. In the left sidebar of the IAM dashboard, click on "Users"
2. You'll see a list of existing users (if any)

### Step 4: Create a New User (Recommended) or Use Existing User

#### Option A: Create a New User (Recommended)

1. Click the "Add users" button
2. Enter a username (e.g., "aarambh-deploy-user")
3. Select "Access key - Programmatic access" 
4. Click "Next: Permissions"

#### Option B: Use Existing User

If you already have a user you want to use:
1. Click on the username in the users list
2. Go to the "Security credentials" tab

### Step 5: Set Permissions (For New User)

1. Select "Add user to group"
2. Click "Create group"
3. Enter a group name (e.g., "AarambhDeploymentGroup")
4. In the policy list, search for and select:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess`
   - `CloudWatchLogsFullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
5. Click "Create group"
6. Ensure your new group is selected
7. Click "Next: Tags" (optional)
8. Click "Next: Review"
9. Review your settings and click "Create user"

### Step 6: Obtain Access Keys

#### For New User:
After creating the user, you'll see a success page with the access key details:
1. The "Access key ID" is displayed directly
2. Click "Show" next to the secret access key to reveal it
3. Click "Download .csv file" to save both credentials securely

#### For Existing User:
1. Go to the "Security credentials" tab
2. In the "Access keys" section, click "Create access key"
3. Choose "Application running outside AWS" as the use case
4. Click "Next"
5. Optionally add a description
6. Click "Create access key"
7. The access key ID and secret access key will be displayed
8. Click "Download .csv file" to save the credentials

### Step 7: Secure Your Credentials

1. Store the downloaded CSV file in a secure location
2. Never share these credentials with anyone
3. Never commit these credentials to version control systems
4. Consider using AWS Secrets Manager for production applications

## Alternative Methods

### Using AWS CLI to Create Access Keys

If you have an existing user with administrative permissions, you can create access keys using the AWS CLI:

```bash
# Create access key for a specific user
aws iam create-access-key --user-name your-username

# The response will include both the AccessKeyId and SecretAccessKey
```

### Using AWS CloudShell

1. Open AWS CloudShell from the AWS console
2. Run the following command:
```bash
aws iam create-access-key --user-name your-username
```

## Security Best Practices

1. **Create Dedicated Users**: Create separate users for different applications or purposes
2. **Use Groups**: Assign permissions through groups rather than directly to users
3. **Enable MFA**: Enable Multi-Factor Authentication for important accounts
4. **Regular Rotation**: Rotate access keys regularly (every 90 days)
5. **Least Privilege**: Only grant the minimum required permissions
6. **Monitor Usage**: Use AWS CloudTrail to monitor access key usage

## Troubleshooting

### Common Issues

1. **"I can't find the IAM service"**: Make sure you're signed in as an administrator
2. **"I don't see the option to create access keys"**: Ensure you have the necessary IAM permissions
3. **"My access key is not working"**: Verify there are no extra spaces when copying the keys

### Key Management

1. **View existing keys**:
   ```bash
   aws iam list-access-keys --user-name your-username
   ```

2. **Delete unused keys**:
   ```bash
   aws iam delete-access-key --user-name your-username --access-key-id YOUR_ACCESS_KEY_ID
   ```

3. **Deactivate keys** (instead of deleting):
   ```bash
   aws iam update-access-key --user-name your-username --access-key-id YOUR_ACCESS_KEY_ID --status Inactive
   ```

## Using Your Credentials

Once you have your credentials, you can configure them in several ways:

### Method 1: AWS CLI Configuration
```bash
aws configure
# Enter your Access Key ID and Secret Access Key when prompted
```

### Method 2: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=us-east-1
```

### Method 3: AWS Credentials File
Edit `~/.aws/credentials`:
```
[default]
aws_access_key_id = your_actual_access_key_id
aws_secret_access_key = your_actual_secret_access_key
```

## Important Notes

1. **You can only view the secret access key once** when you create it. If you lose it, you must create a new access key.
2. **Each user can have a maximum of two access keys**.
3. **Access keys are permanent** until you rotate or delete them.
4. **Store credentials securely** and never share them.

## Next Steps

After obtaining your credentials:

1. Update your `~/.aws/credentials` file with the actual values
2. Test your configuration:
   ```bash
   aws sts get-caller-identity
   ```
3. Proceed with your deployment tasks

## Additional Resources

- [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [AWS Security Best Practices](https://docs.aws.amazon.com/general/latest/gr/aws-security-best-practices.html)
- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)