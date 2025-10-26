# AWS Elastic Beanstalk Permissions Fix Guide

This guide will help you resolve the "NotAuthorizedError - Operation Denied" error when using Elastic Beanstalk.

## Understanding the Issue

The error occurs because your IAM user `aarambh-deploy` doesn't have the necessary permissions to perform the `ec2:ImportKeyPair` action. This is required when Elastic Beanstalk tries to import your SSH key pair to EC2.

## Solution: Update IAM Permissions

### Step 1: Add Required EC2 Permissions

You need to add the following EC2 permissions to your IAM user or group:

1. Sign in to the AWS Management Console
2. Navigate to the IAM service
3. Find your user (`aarambh-deploy`) or the group it belongs to
4. Attach the following additional policies or add these permissions:

#### Required EC2 Permissions:
- `ec2:ImportKeyPair`
- `ec2:DescribeKeyPairs`
- `ec2:CreateKeyPair`
- `ec2:DeleteKeyPair`

### Step 2: Option A - Attach AmazonEC2FullAccess Policy (Quick Solution)

The quickest way to resolve this is to attach the `AmazonEC2FullAccess` policy:

1. Go to IAM Console
2. Find your user or group
3. Click "Add permissions"
4. Select "Attach existing policies directly"
5. Search for and select `AmazonEC2FullAccess`
6. Click "Next" and then "Add permissions"

### Step 3: Option B - Create Custom Policy (More Secure)

For better security, create a custom policy with only the required permissions:

1. Go to IAM Console
2. In the left sidebar, click "Policies"
3. Click "Create policy"
4. Select the "JSON" tab
5. Replace the content with the following:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:ImportKeyPair",
        "ec2:DescribeKeyPairs",
        "ec2:CreateKeyPair",
        "ec2:DeleteKeyPair"
      ],
      "Resource": "*"
    }
  ]
}
```

6. Click "Next: Tags"
7. Click "Next: Review"
8. Enter a name (e.g., "EB-EC2-KeyPair-Access")
9. Click "Create policy"
10. Attach this policy to your user or group

### Step 4: Alternative Approach - Skip SSH Key Import

If you don't need SSH access to your instances, you can skip the key import step:

1. Edit your EB configuration:
   ```bash
   nano server/.elasticbeanstalk/config.yml
   ```

2. Remove or comment out the SSH key configuration:
   ```yaml
   # default_ec2_keyname: aws-eb
   ```

## Handling Token Errors

If you encounter token errors like "The security token included in the request is invalid", refer to [AWS_EB_TOKEN_ERROR_FIX.md](AWS_EB_TOKEN_ERROR_FIX.md) for detailed instructions on resolving credential issues.

## Workaround Solutions

### Workaround 1: Manually Upload SSH Key to EC2

1. Go to AWS EC2 Console
2. In the left sidebar, under "Network & Security", click "Key Pairs"
3. Click "Import Key Pair"
4. Enter a name (e.g., "aws-eb")
5. Copy the content of your public key file:
   ```bash
   cat ~/.ssh/aws-eb.pub
   ```
6. Paste the content into the "Public key contents" field
7. Click "Import Key Pair"

### Workaround 2: Use Existing Key Pair

If you already have a key pair in EC2:

1. List available key pairs:
   ```bash
   # If AWS CLI is installed
   aws ec2 describe-key-pairs
   ```

2. Update your EB configuration to use an existing key:
   ```bash
   cd server
   eb init
   ```
   When prompted for SSH key, select an existing key pair.

## Verifying Permissions

After updating permissions, verify that your user has the required access:

1. Try the EB initialization again:
   ```bash
   cd server
   eb init
   ```

2. If you still encounter issues, check your user's attached policies:
   ```bash
   # If AWS CLI is installed
   aws iam list-attached-user-policies --user-name aarambh-deploy
   ```

## Security Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions required
2. **Use Groups**: Attach policies to groups rather than individual users
3. **Regular Review**: Periodically review and audit permissions
4. **Separation of Duties**: Use different users for different tasks

## Troubleshooting Common Issues

### Issue 1: Still Getting Permission Denied

1. Ensure the policy is attached to the correct user or group
2. Wait a few minutes for permissions to propagate
3. Try logging out and back into the AWS console

### Issue 2: Key Already Exists

If you get an error that the key already exists:

1. Delete the existing key pair in the EC2 console
2. Or use a different key name

### Issue 3: SSH Key Not Found

If you get the original SSH key error again:

1. Verify the key files exist:
   ```bash
   ls -la ~/.ssh/aws-eb*
   ```

2. Check file permissions:
   ```bash
   chmod 600 ~/.ssh/aws-eb
   chmod 644 ~/.ssh/aws-eb.pub
   ```

## Alternative: Use AWS Systems Manager Session Manager

Instead of SSH keys, you can use AWS Systems Manager Session Manager for accessing your instances:

1. Install the Session Manager plugin for AWS CLI
2. Configure IAM roles with Session Manager permissions
3. Use the AWS Console or CLI to start sessions

This approach is more secure as it doesn't require SSH keys or open SSH ports.

## Next Steps

After updating your permissions:

1. Try initializing EB CLI again:
   ```bash
   cd server
   eb init
   ```

2. Create your environment:
   ```bash
   eb create production
   ```

3. Deploy your application:
   ```bash
   eb deploy
   ```

## Additional Resources

- [AWS Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [EC2 Key Pairs Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)