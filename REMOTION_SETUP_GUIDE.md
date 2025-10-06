# Remotion Video Rendering Setup Guide

This guide will help you set up Remotion video rendering in your Next.js application with AWS Lambda integration.

## Prerequisites

- AWS Account with appropriate permissions
- Node.js and npm installed
- Next.js application with Remotion dependencies

## Step 1: Environment Setup

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Add your AWS credentials to `.env`:**
   ```env
   # Required AWS credentials
   REMOTION_AWS_ACCESS_KEY_ID=your_access_key_here
   REMOTION_AWS_SECRET_ACCESS_KEY=your_secret_key_here
   
   # Optional: AWS Region (defaults to us-east-1)
   AWS_REGION=us-east-1
   ```

3. **Get AWS credentials:**
   - Go to AWS Console → IAM → Users → Your User → Security Credentials
   - Create new Access Key if needed
   - Copy Access Key ID and Secret Access Key

## Step 2: Deploy Remotion Infrastructure

Run the deployment script to set up AWS Lambda and S3:

```bash
npm run deploy
```

This will:
- Create/update Lambda function for video rendering
- Create/verify S3 bucket for storage
- Deploy your Remotion site to S3

## Step 3: Verify Configuration

Check that your constants match the deployed infrastructure:

```typescript
// components/editor/version-7.0.0/constants.ts
export const SITE_NAME = "sams-site";
export const LAMBDA_FUNCTION_NAME = "remotion-render-4-0-272-mem2048mb-disk2048mb-120sec";
export const REGION = "us-east-1";
```

**Important:** The Lambda function name should match what was deployed. If it's different, update the constant.

## Step 4: Test the Rendering Pipeline

### API Endpoints

The setup includes two main API endpoints:

1. **Render Endpoint:** `/api/latest/lambda/render`
   - Initiates video rendering on AWS Lambda
   - Returns render ID for progress tracking

2. **Progress Endpoint:** `/api/latest/lambda/progress`
   - Checks rendering progress
   - Returns completion status and download URL

### Example Usage

```typescript
// Start a render
const renderResponse = await fetch('/api/latest/lambda/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'TestComponent', // Must match composition ID
    inputProps: {
      overlays: [...], // Your overlay data
      durationInFrames: 300,
      fps: 30,
      width: 1920,
      height: 1080
    }
  })
});

const { renderId, bucketName } = await renderResponse.json();

// Poll for progress
const progressResponse = await fetch('/api/latest/lambda/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: renderId,
    bucketName: bucketName
  })
});

const progress = await progressResponse.json();
```

## Common Issues and Solutions

### 1. "Access Denied" Error
**Problem:** Remotion site not deployed to S3
**Solution:** Run `npm run deploy` to deploy the site

### 2. Missing AWS Credentials
**Problem:** Environment variables not set
**Solution:** 
- Check `.env` file has correct credentials
- Verify credential names match what's expected
- Test credentials with AWS CLI

### 3. Lambda Function Not Found
**Problem:** Function name doesn't match deployed function
**Solution:**
- Check AWS Lambda console for actual function name
- Update `LAMBDA_FUNCTION_NAME` constant
- Redeploy if needed

### 4. Composition Not Found
**Problem:** Composition ID doesn't match
**Solution:**
- Ensure composition ID in render request matches `COMP_NAME` constant
- Check that composition is properly exported in Remotion setup

### 5. Memory/Timeout Issues
**Problem:** Complex renders failing
**Solution:**
- Increase Lambda memory in `config.mjs`
- Increase timeout in `config.mjs`
- Optimize video complexity

## File Structure

```
components/editor/version-7.0.0/
├── remotion/
│   ├── index.ts          # Entry point
│   ├── root.tsx          # Root component
│   └── main.tsx          # Main composition
├── constants.ts          # Configuration
└── types.ts              # Type definitions

app/api/latest/lambda/
├── render/route.ts       # Render endpoint
└── progress/route.ts     # Progress endpoint

deploy.mjs                # Deployment script
config.mjs                # AWS configuration
```

## Configuration Files

### config.mjs
```javascript
export const REGION = "us-east-1";
export const SITE_NAME = "sams-site";
export const RAM = 3009;        // Lambda memory (MB)
export const DISK = 10240;      // Lambda disk space (MB)
export const TIMEOUT = 240;     // Lambda timeout (seconds)
```

### constants.ts
```typescript
export const COMP_NAME = "TestComponent";
export const SITE_NAME = "sams-site";
export const LAMBDA_FUNCTION_NAME = "remotion-render-4-0-272-mem3009mb-disk10240mb-240sec";
export const REGION = "us-east-1";
```

## Debugging

Enable detailed logging by checking console output for:

1. **Render requests:** Logged in render endpoint
2. **Progress checks:** Logged in progress endpoint
3. **AWS errors:** Detailed error messages
4. **Configuration:** All settings logged on startup

## Next Steps

1. **Test with simple composition:** Start with basic video
2. **Monitor AWS costs:** Lambda usage is charged per request
3. **Optimize performance:** Adjust memory/timeout as needed
4. **Add error handling:** Implement retry logic for failed renders

## Support

If you encounter issues:

1. Check AWS CloudWatch logs for Lambda errors
2. Verify all environment variables are set
3. Ensure Remotion site is deployed
4. Test with minimal composition first

For more details, see the [Remotion Lambda documentation](https://www.remotion.dev/docs/lambda).
