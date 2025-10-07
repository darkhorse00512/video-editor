# AWS IAM Setup for Remotion Lambda

This guide will help you set up the correct IAM permissions for Remotion Lambda deployment.

## Prerequisites

- AWS Account with admin access (or ability to create IAM users/policies)
- Access to AWS IAM Console

## Step 1: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add users**
3. Enter username (e.g., `remotion-deploy`)
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**

## Step 2: Create Custom Policy

Instead of attaching the policy directly to the user, let's create a custom policy first:

1. In IAM Console, click **Policies** → **Create policy**
2. Click **JSON** tab
3. Paste the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "HandleQuotas",
            "Effect": "Allow",
            "Action": [
                "servicequotas:GetServiceQuota",
                "servicequotas:GetAWSDefaultServiceQuota",
                "servicequotas:RequestServiceQuotaIncrease",
                "servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota"
            ],
            "Resource": ["*"]
        },
        {
            "Sid": "PermissionValidation",
            "Effect": "Allow",
            "Action": [
                "iam:SimulatePrincipalPolicy"
            ],
            "Resource": ["*"]
        },
        {
            "Sid": "LambdaInvokation",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::*:role/remotion-lambda-role"
            ]
        },
        {
            "Sid": "Storage",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl",
                "s3:PutObject",
                "s3:CreateBucket",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:PutBucketAcl",
                "s3:DeleteBucket",
                "s3:PutBucketOwnershipControls",
                "s3:PutBucketPublicAccessBlock",
                "s3:PutLifecycleConfiguration"
            ],
            "Resource": [
                "arn:aws:s3:::remotionlambda-*"
            ]
        },
        {
            "Sid": "BucketListing",
            "Effect": "Allow",
            "Action": [
                "s3:ListAllMyBuckets"
            ],
            "Resource": ["*"]
        },
        {
            "Sid": "FunctionListing",
            "Effect": "Allow",
            "Action": [
                "lambda:ListFunctions",
                "lambda:GetFunction"
            ],
            "Resource": ["*"]
        },
        {
            "Sid": "FunctionManagement",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeAsync",
                "lambda:InvokeFunction",
                "lambda:CreateFunction",
                "lambda:DeleteFunction",
                "lambda:PutFunctionEventInvokeConfig",
                "lambda:PutRuntimeManagementConfig",
                "lambda:TagResource"
            ],
            "Resource": [
                "arn:aws:lambda:*:*:function:remotion-render-*"
            ]
        },
        {
            "Sid": "LogsRetention",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:PutRetentionPolicy"
            ],
            "Resource": [
                "arn:aws:logs:*:*:log-group:/aws/lambda/remotion-render-*"
            ]
        },
        {
            "Sid": "FetchBinaries",
            "Effect": "Allow",
            "Action": [
                "lambda:GetLayerVersion"
            ],
            "Resource": [
                "arn:aws:lambda:*:678892195805:layer:remotion-binaries-*",
                "arn:aws:lambda:*:580247275435:layer:LambdaInsightsExtension*"
            ]
        }
    ]
}
```

4. Click **Next: Tags** (optional)
5. Click **Next: Review**
6. Name the policy: `RemotionLambdaDeployPolicy`
7. Add description: `Policy for deploying and managing Remotion Lambda functions`
8. Click **Create policy**

## Step 3: Attach Policy to User

1. Go back to **Users** → Select your user (or create new one)
2. Click **Add permissions** → **Attach policies directly**
3. Search for `RemotionLambdaDeployPolicy`
4. Select the policy
5. Click **Next** → **Add permissions**

## Step 4: Create Access Keys

1. Click on your user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. Click **Next**
6. Add description: `Remotion video editor deployment`
7. Click **Create access key**
8. **IMPORTANT:** Copy both:
   - Access key ID
   - Secret access key
9. Save these securely!

## Step 5: Configure Your Project

Add the credentials to your `.env` file:

```env
REMOTION_AWS_ACCESS_KEY_ID=your_access_key_id_here
REMOTION_AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
```

Or using standard AWS names:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
```

## Step 6: Deploy

Now try deploying:

```bash
npm run deploy
```

## What Each Permission Does

### Service Quotas
- Check and request increases for AWS service limits
- Important for scaling Lambda functions

### IAM Permissions
- `SimulatePrincipalPolicy`: Validate permissions
- `PassRole`: Allow Lambda to assume execution role

### S3 Storage
- Create and manage S3 buckets for storing videos and assets
- Bucket names must start with `remotionlambda-`

### Lambda Functions
- Create, delete, and invoke Lambda functions
- Function names must start with `remotion-render-`

### CloudWatch Logs
- Create log groups for Lambda function logs
- Set retention policies for logs

### Lambda Layers
- Access Remotion binaries layer (pre-built Chrome, FFmpeg)
- Required for video rendering

## Troubleshooting

### "Access Denied" Errors

**Check if user has the policy:**
```bash
# If you have AWS CLI installed
aws iam list-attached-user-policies --user-name remotion-deploy
```

**Verify credentials:**
```bash
# Test basic AWS access
aws sts get-caller-identity
```

### Network Connection Issues

If you're getting `ECONNRESET` errors:

1. **Check network connectivity:**
   - Try accessing AWS Console in browser
   - Ping AWS services: `ping s3.amazonaws.com`

2. **Check if behind firewall/proxy:**
   - Configure proxy settings if needed
   - Try different network (mobile hotspot)

3. **VPN issues:**
   - Try disconnecting VPN
   - Some VPNs block AWS connections

### Permission Issues

If deployment fails with permission errors:

1. **Verify all permissions are attached:**
   - Go to IAM → Users → Your User → Permissions
   - Ensure `RemotionLambdaDeployPolicy` is listed

2. **Check credential expiry:**
   - Some credentials have expiration dates
   - Regenerate if expired

3. **Region restrictions:**
   - Ensure your user has permissions in the region you're deploying to
   - Check `config.mjs` for region setting

## Security Best Practices

1. **Don't use root account credentials**
   - Always create an IAM user for deployments

2. **Rotate keys regularly**
   - Change access keys every 90 days

3. **Use least privilege**
   - The policy provided gives only necessary permissions

4. **Never commit credentials**
   - Add `.env` to `.gitignore`
   - Use environment variables

5. **Monitor usage**
   - Check AWS CloudTrail for API calls
   - Set up billing alerts

## Alternative: Using AWS CLI Profiles

If you have AWS CLI configured:

```bash
# Configure profile
aws configure --profile remotion
# Enter: Access Key, Secret Key, Region, Output format

# Deploy using profile
AWS_PROFILE=remotion npm run deploy
```

## Need Help?

If you're still having issues:

1. Check AWS CloudTrail for specific permission errors
2. Verify your IAM user has all required permissions
3. Ensure network connectivity to AWS
4. Check AWS service status: https://status.aws.amazon.com/
5. Review the REMOTION_SETUP_GUIDE.md for deployment issues

## References

- [Remotion Lambda Setup](https://www.remotion.dev/docs/lambda/setup)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Service Limits](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html)

