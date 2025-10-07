import { deployFunction } from "@remotion/lambda";
import dotenv from "dotenv";
import { RAM, REGION, TIMEOUT, DISK } from "./config.mjs";

/**
 * This script deploys only the Lambda function for Remotion video rendering.
 * Use this when you only need to update the Lambda function configuration.
 */

console.log("Deploying Lambda function to region:", REGION);
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
  process.stdout.write("Deploying Lambda function... ");
  
  const { functionName, alreadyExisted } = await deployFunction({
    createCloudWatchLogGroup: true,
    memorySizeInMb: RAM,
    region: REGION,
    timeoutInSeconds: TIMEOUT,
    diskSizeInMb: DISK,
  });
  
  console.log(functionName, alreadyExisted ? "(already existed)" : "(created)");
  console.log("\n✅ Lambda function deployed successfully!");
  console.log("\nFunction details:");
  console.log("  Name:", functionName);
  console.log("  Region:", REGION);
  console.log("  Memory:", RAM, "MB");
  console.log("  Disk:", DISK, "MB");
  console.log("  Timeout:", TIMEOUT, "seconds");
  console.log("\nUpdate your constants.ts with this function name if different.");
  
} catch (error) {
  console.error("\n\n❌ Failed to deploy Lambda function");
  console.error("Error:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Check your AWS credentials in .env file");
  console.error("2. Verify IAM permissions (see AWS_IAM_SETUP.md)");
  console.error("3. Check network connectivity");
  console.error("4. Try a different network if behind firewall/proxy");
  process.exit(1);
}

