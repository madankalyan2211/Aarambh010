# AWS Elastic Beanstalk Permissions Fix

This document explains how to resolve the "NotAuthorizedError" when deploying to AWS Elastic Beanstalk.

## Error Details

```
ERROR: NotAuthorizedError - Operation Denied. User: arn:aws:iam::925047940952:user/Aarambh-app is not authorized to perform: elasticbeanstalk:CreateApplication on resource: arn:aws:elasticbeanstalk:us-east-1:925047940952:application/aarambh-backend
```

## Root Cause

The AWS user [Aarambh-app](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/server/config/email.config.js#L43-L43) lacks the necessary IAM permissions to perform Elastic Beanstalk operations, specifically the `elasticbeanstalk:CreateApplication` action.

## Solution Options

### Option 1: Attach Managed Policies (Recommended)

Attach the following AWS managed policies to your user:

1. **AWSElasticBeanstalkFullAccess** - Provides full access to Elastic Beanstalk
2. **AdministratorAccess** - Provides full access to all AWS services (use with caution)

To attach these policies:

1. Go to the [IAM Console](https://console.aws.amazon.com/iam/)
2. Select "Users" from the left sidebar
3. Click on the user "Aarambh-app"
4. Go to the "Permissions" tab
5. Click "Add permissions"
6. Select "Attach existing policies directly"
7. Search for and select "AWSElasticBeanstalkFullAccess"
8. Click "Next" and then "Add permissions"

### Option 2: Create Custom IAM Policy

If you prefer more granular control, create a custom policy with only the required permissions:

1. Go to the [IAM Console](https://console.aws.amazon.com/iam/)
2. Select "Policies" from the left sidebar
3. Click "Create policy"
4. Select the "JSON" tab
5. Replace the content with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "ec2:Describe*",
        "elasticloadbalancing:Describe*",
        "autoscaling:Describe*",
        "cloudwatch:Describe*",
        "cloudwatch:List*",
        "cloudwatch:Get*",
        "s3:Get*",
        "s3:List*",
        "sns:Get*",
        "sns:List*",
        "cloudformation:Describe*",
        "cloudformation:Get*",
        "cloudformation:List*",
        "cloudformation:Validate*",
        "rds:Describe*",
        "rds:List*",
        "logs:Describe*",
        "logs:Get*",
        "logs:Filter*",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:TestMetricFilter",
        "logs:PutSubscriptionFilter",
        "logs:PutLogEvents",
        "logs:CreateLogGroup",
        "logs:CreateLogStream"
      ],
      "Resource": "*"
    }
  ]
}
```

6. Click "Next: Tags"
7. Click "Next: Review"
8. Name the policy (e.g., "Aarambh-ElasticBeanstalk-Deploy")
9. Click "Create policy"
10. Attach this policy to your user following the steps in Option 1 (steps 1-5, then search for your new policy)

### Option 3: Use AWS EB CLI with Specific Credentials

You can also configure the EB CLI to use specific credentials with appropriate permissions:

1. Create a new IAM user with the necessary permissions
2. Configure the EB CLI to use this user's credentials:

```bash
eb init --profile your-eb-profile
```

Where `your-eb-profile` is a profile name you've configured in your AWS credentials file.

## Verification Steps

After applying the permissions, verify they're working:

1. Test AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Test EB CLI:
   ```bash
   eb list
   ```

3. Try the deployment again:
   ```bash
   cd server
   eb deploy
   ```

## Alternative Solution: Use Existing Application

If you don't want to modify permissions, you can deploy to an existing Elastic Beanstalk application:

1. List existing applications:
   ```bash
   aws elasticbeanstalk describe-applications
   ```

2. If you have an existing application, initialize EB CLI with it:
   ```bash
   eb init --interactive
   ```
   Select the existing application when prompted.

## Security Best Practices

1. **Principle of Least Privilege**: Grant only the minimum permissions required
2. **Use IAM Roles**: For production applications, consider using IAM roles instead of user credentials
3. **Regular Review**: Periodically review and audit IAM permissions
4. **Multi-Factor Authentication**: Enable MFA for users with deployment permissions

## Troubleshooting Tips

1. **Policy Propagation Delay**: IAM policy changes can take a few minutes to propagate
2. **Session Tokens**: If using temporary credentials, ensure they haven't expired
3. **Region Mismatch**: Ensure you're deploying to the correct AWS region
4. **Service Limits**: Check if you've reached any AWS service limits

## Related Documentation

- [AWS_EB_PERMISSIONS_FIX.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_EB_PERMISSIONS_FIX.md)
- [AWS_PERMISSIONS_SETUP.md](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_PERMISSIONS_SETUP.md)
- [AWS_RESTRICTED_POLICIES.json](file:///Users/madanthambisetty/Downloads/aarambh%20blue%20good%20with%20quizzes/AWS_RESTRICTED_POLICIES.json)