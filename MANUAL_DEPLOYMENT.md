# Manual Lambda Deployment Guide

This guide shows you how to manually deploy each component of the Remotion Lambda infrastructure.

## Overview

The deployment consists of 3 main steps:
1. Deploy Lambda Function
2. Create/Verify S3 Bucket
3. Deploy Remotion Site

## Method 1: Using Separate Scripts (Recommended)

I'll create separate npm scripts so you can deploy each component individually.

### Individual Deployment Commands

```bash
# Deploy only the Lambda function
npm run deploy:function

# Create/verify S3 bucket only
npm run deploy:bucket

# Deploy only the Remotion site
npm run deploy:site

# Or deploy everything at once (same as before)
npm run deploy
```

## Method 2: Manual Deployment with Remotion CLI

You can also use the Remotion CLI commands directly.

### Step 1: Deploy Lambda Function

```bash
npx remotion lambda functions deploy \
  --memory 3009 \
  --disk 10240 \
  --timeout 240 \
  --region us-east-1
```

This will:
- Create a Lambda function for video rendering
- Set memory to 3009 MB
- Set disk space to 10240 MB
- Set timeout to 240 seconds
- Deploy to us-east-1 region

**Output:** You'll get a function name like `remotion-render-4-0-272-mem3009mb-disk10240mb-240sec`

### Step 2: Create S3 Bucket

```bash
npx remotion lambda buckets create \
  --region us-east-1
```

This will:
- Create an S3 bucket for storing rendered videos
- Bucket name format: `remotionlambda-useast1-xxxxxxxxxx`

**Output:** Bucket name

### Step 3: Deploy Remotion Site

```bash
npx remotion lambda sites create \
  components/editor/version-7.0.0/remotion/index.ts \
  --site-name sams-site \
  --region us-east-1
```

This will:
- Bundle your Remotion project
- Upload it to S3 as a static site
- Create a serve URL that Lambda can access

**Output:** Site name and serve URL

## Method 3: Using AWS Console (Fully Manual)

If you want to deploy through AWS Console:

### Step 1: Create Lambda Function via Console

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click **Create function**
3. Select **Author from scratch**
4. Configuration:
   - **Function name:** `remotion-render-custom`
   - **Runtime:** Node.js 18.x or higher
   - **Architecture:** x86_64
   - **Execution role:** Create new role or use existing
5. Click **Create function**

### Step 2: Configure Lambda Settings

1. Go to **Configuration** tab
2. **General configuration:**
   - Memory: 3009 MB
   - Timeout: 4 minutes (240 seconds)
   - Ephemeral storage: 10240 MB
3. **Environment variables:**
   - Add any needed variables

### Step 3: Upload Remotion Code

This is complex for manual upload. Use the Remotion CLI instead:

```bash
npx remotion lambda sites create \
  components/editor/version-7.0.0/remotion/index.ts \
  --site-name sams-site \
  --region us-east-1
```

## Updating Constants After Manual Deployment

After deploying manually, update your constants:

### Update `components/editor/version-7.0.0/constants.ts`:

```typescript
// Use the function name from deployment output
export const LAMBDA_FUNCTION_NAME = "remotion-render-4-0-272-mem3009mb-disk10240mb-240sec";

// Use the site name you specified
export const SITE_NAME = "sams-site";

// Use your deployment region
export const REGION = "us-east-1";
```

### Update `config.mjs`:

```javascript
export const REGION = "us-east-1";
export const SITE_NAME = "sams-site";
export const RAM = 3009;
export const DISK = 10240;
export const TIMEOUT = 240;
```

## Troubleshooting Manual Deployment

### Issue: npx commands fail

**Solution:**
```bash
# Install Remotion Lambda globally
npm install -g @remotion/lambda

# Then use remotion command directly
remotion lambda functions deploy ...
```

### Issue: Permission errors

**Solution:**
- Verify your AWS credentials are set:
  ```bash
  echo $AWS_ACCESS_KEY_ID
  echo $AWS_SECRET_ACCESS_KEY
  ```
- Check IAM permissions (see AWS_IAM_SETUP.md)

### Issue: Network errors

**Solution:**
- Check internet connection
- Try different network
- Add longer timeout flags if available

## Verifying Deployment

### Check Lambda Function

```bash
npx remotion lambda functions ls --region us-east-1
```

### Check S3 Buckets

```bash
npx remotion lambda buckets ls --region us-east-1
```

### Check Deployed Sites

```bash
npx remotion lambda sites ls --region us-east-1
```

## Cleaning Up (Removing Resources)

### Remove Lambda Function

```bash
npx remotion lambda functions rm remotion-render-4-0-272-mem3009mb-disk10240mb-240sec \
  --region us-east-1
```

### Remove Site

```bash
npx remotion lambda sites rm sams-site \
  --region us-east-1
```

### Remove Bucket

```bash
npx remotion lambda buckets rm remotionlambda-useast1-xxxxxxxxxx \
  --region us-east-1
```

## Advanced: Deployment Scripts

You can create your own deployment scripts for more control:

### deploy-function.mjs

```javascript
import { deployFunction } from "@remotion/lambda";
import dotenv from "dotenv";

dotenv.config();

const { functionName } = await deployFunction({
  createCloudWatchLogGroup: true,
  memorySizeInMb: 3009,
  region: "us-east-1",
  timeoutInSeconds: 240,
  diskSizeInMb: 10240,
});

console.log("Function deployed:", functionName);
```

### deploy-site.mjs

```javascript
import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const { bucketName } = await getOrCreateBucket({ region: "us-east-1" });
const { siteName } = await deploySite({
  bucketName,
  entryPoint: path.join(process.cwd(), "components", "editor", "version-7.0.0", "remotion", "index.ts"),
  siteName: "sams-site",
  region: "us-east-1",
});

console.log("Site deployed:", siteName);
console.log("Bucket:", bucketName);
```

Then add to `package.json`:

```json
{
  "scripts": {
    "deploy:function": "node deploy-function.mjs",
    "deploy:site": "node deploy-site.mjs",
    "deploy": "node deploy.mjs"
  }
}
```

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm run deploy` | Deploy everything (function + bucket + site) |
| `npm run deploy:function` | Deploy Lambda function only |
| `npm run deploy:site` | Deploy Remotion site only |
| `npx remotion lambda functions ls` | List all Lambda functions |
| `npx remotion lambda sites ls` | List all deployed sites |
| `npx remotion lambda buckets ls` | List all S3 buckets |

## Need Help?

- Check [AWS IAM Setup Guide](./AWS_IAM_SETUP.md) for permission issues
- Check [Remotion Setup Guide](./REMOTION_SETUP_GUIDE.md) for deployment issues
- See [Remotion Docs](https://www.remotion.dev/docs/lambda) for advanced configuration

