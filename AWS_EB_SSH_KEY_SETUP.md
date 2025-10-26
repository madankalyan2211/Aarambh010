# AWS Elastic Beanstalk SSH Key Setup Guide

This guide will help you resolve the "NotSupportedError - The EB CLI cannot find your SSH key file" error.

## Understanding the Issue

The error occurs because Elastic Beanstalk is configured to use an SSH key named "aws-eb" but cannot find the corresponding key file in your `~/.ssh/` directory.

## Solution Options

### Option 1: Create a New SSH Key (Recommended)

1. **Generate a new SSH key pair**:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/aws-eb
   ```

2. **When prompted**:
   - Press Enter to use the default file location
   - Enter a passphrase (optional but recommended for security) or press Enter for no passphrase

3. **Set proper permissions**:
   ```bash
   chmod 600 ~/.ssh/aws-eb
   chmod 644 ~/.ssh/aws-eb.pub
   ```

### Option 2: Use an Existing SSH Key

If you already have an SSH key you'd like to use:

1. **Copy your existing key to the expected location**:
   ```bash
   cp /path/to/your/existing/key ~/.ssh/aws-eb
   cp /path/to/your/existing/key.pub ~/.ssh/aws-eb.pub
   ```

2. **Set proper permissions**:
   ```bash
   chmod 600 ~/.ssh/aws-eb
   chmod 644 ~/.ssh/aws-eb.pub
   ```

### Option 3: Configure EB CLI to Use a Different Key

1. **Initialize EB CLI again**:
   ```bash
   cd server
   eb init
   ```

2. **When prompted for SSH key**:
   - Select "Select a keypair"
   - Choose an existing key or create a new one

### Option 4: Skip SSH Setup (If You Don't Need SSH Access)

If you don't need SSH access to your Elastic Beanstalk instances:

1. **Edit your EB configuration**:
   ```bash
   nano .elasticbeanstalk/config.yml
   ```

2. **Remove or comment out the SSH key configuration**:
   ```yaml
   # default_ec2_keyname: aws-eb
   ```

## Detailed Steps for Option 1 (Creating a New SSH Key)

### Step 1: Generate SSH Key Pair

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/aws-eb
```

You'll see output similar to:
```
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /Users/yourusername/.ssh/aws-eb
Your public key has been saved in /Users/yourusername/.ssh/aws-eb.pub
```

### Step 2: Set Proper Permissions

```bash
chmod 600 ~/.ssh/aws-eb
chmod 644 ~/.ssh/aws-eb.pub
```

### Step 3: Verify Key Files

```bash
ls -la ~/.ssh/aws-eb*
```

You should see two files:
- `~/.ssh/aws-eb` (private key)
- `~/.ssh/aws-eb.pub` (public key)

### Step 4: Add Key to SSH Agent (Optional)

```bash
ssh-add ~/.ssh/aws-eb
```

## Uploading SSH Key to AWS (If Needed)

If you want to use your SSH key with EC2 instances:

1. **Go to AWS EC2 Console**
2. **Navigate to "Key Pairs" under "Network & Security"**
3. **Click "Import Key Pair"**
4. **Enter a name (e.g., "aws-eb")**
5. **Copy and paste the contents of your public key file**:
   ```bash
   cat ~/.ssh/aws-eb.pub
   ```
6. **Click "Import"**

## Handling Permission Errors

If you encounter permission errors like "NotAuthorizedError - Operation Denied", refer to [AWS_EB_PERMISSIONS_FIX.md](AWS_EB_PERMISSIONS_FIX.md) for detailed instructions on updating your IAM permissions.

## Testing Your SSH Key

To test if your SSH key is working:

```bash
# Test SSH connection (replace with your actual EB instance)
ssh -i ~/.ssh/aws-eb ec2-user@your-eb-instance.amazonaws.com
```

## Reinitializing EB CLI

After setting up your SSH key, reinitialize the EB CLI:

```bash
cd server
eb init
```

When prompted about the SSH key, select your newly created key.

## Troubleshooting Common Issues

### Issue 1: "Permissions are too open" Error

If you get a "permissions are too open" error:

```bash
chmod 600 ~/.ssh/aws-eb
chmod 644 ~/.ssh/aws-eb.pub
chmod 700 ~/.ssh
```

### Issue 2: "No such file or directory" Error

Ensure the `.ssh` directory exists:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### Issue 3: EB CLI Still Can't Find Key

1. **Check your EB configuration**:
   ```bash
   cat .elasticbeanstalk/config.yml
   ```

2. **Ensure the key name matches your actual key file name**

3. **Reinitialize EB CLI**:
   ```bash
   eb init
   ```

## Security Best Practices

1. **Never share your private key** (`~/.ssh/aws-eb`)
2. **Set proper file permissions** (600 for private key, 644 for public key)
3. **Use a strong passphrase** when generating keys
4. **Regularly rotate SSH keys** for security
5. **Store keys securely** and back them up

## Alternative: Using AWS Systems Manager Session Manager

Instead of SSH, you can use AWS Systems Manager Session Manager for accessing your instances:

1. **Install the Session Manager plugin** for AWS CLI
2. **Configure IAM roles** with Session Manager permissions
3. **Use the AWS Console or CLI** to start sessions

This approach is more secure as it doesn't require SSH keys or open SSH ports.

## Next Steps

After setting up your SSH key:

1. **Reinitialize EB CLI**:
   ```bash
   cd server
   eb init
   ```

2. **Create your environment**:
   ```bash
   eb create production
   ```

3. **Deploy your application**:
   ```bash
   eb deploy
   ```

## Additional Resources

- [AWS Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [AWS EC2 Key Pairs Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [SSH Key Generation Guide](https://www.ssh.com/ssh/keygen/)