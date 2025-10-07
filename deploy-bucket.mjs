import { getOrCreateBucket } from "@remotion/lambda";
import dotenv from "dotenv";
import { REGION } from "./config.mjs";

/**
 * This script creates or verifies the S3 bucket for Remotion Lambda.
 * Use this when you only need to create/check the S3 bucket.
 */

console.log("Creating/verifying S3 bucket in region:", REGION);
dotenv.config();

// Check AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
  console.error('ERROR: AWS_ACCESS_KEY_ID or REMOTION_AWS_ACCESS_KEY_ID is not set.');
  console.error('Please add your AWS credentials to the .env file.');
  process.exit(1);
}

if (!process.env.AWS_SECRET_ACCESS_KEY && !process.env.REMOTION_AWS_SECRET_ACCESS_KEY) {
  console.error('ERROR: AWS_SECRET_ACCESS_KEY or REMOTION_AWS_SECRET_ACCESS_KEY is not set.');
  console.error('Please add your AWS credentials to the .env file.');
  process.exit(1);
}

try {
  process.stdout.write("Creating/verifying S3 bucket... ");
  
  const { bucketName, alreadyExisted } = await getOrCreateBucket({
    region: REGION,
  });
  
  console.log(bucketName, alreadyExisted ? "(already existed)" : "(created)");
  console.log("\n✅ S3 bucket ready!");
  console.log("\nBucket details:");
  console.log("  Name:", bucketName);
  console.log("  Region:", REGION);
  console.log("  Status:", alreadyExisted ? "Existing bucket" : "New bucket created");
  console.log("\nYou can now deploy sites to this bucket using:");
  console.log("  npm run deploy:site");
  
} catch (error) {
  console.error("\n\n❌ Failed to create/verify S3 bucket");
  console.error("Error:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Check your AWS credentials in .env file");
  console.error("2. Verify IAM permissions (see AWS_IAM_SETUP.md)");
  console.error("3. Check network connectivity");
  console.error("4. Try a different network if behind firewall/proxy");
  process.exit(1);
}
