import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import { REGION, SITE_NAME } from "./config.mjs";

/**
 * This script deploys only the Remotion site to S3.
 * Use this when you've made changes to your video compositions or templates.
 */

console.log("Deploying Remotion site to region:", REGION);
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
  // First, ensure bucket exists
  process.stdout.write("Ensuring S3 bucket exists... ");
  const { bucketName, alreadyExisted: bucketAlreadyExisted } = await getOrCreateBucket({
    region: REGION,
  });
  console.log(bucketName, bucketAlreadyExisted ? "(already existed)" : "(created)");

  // Deploy the site
  process.stdout.write("Deploying Remotion site... ");
  const { siteName, serveUrl } = await deploySite({
    bucketName,
    entryPoint: path.join(process.cwd(), "components", "editor", "version-7.0.0", "remotion", "index.ts"),
    siteName: SITE_NAME,
    region: REGION,
  });
  
  console.log(siteName);
  console.log("\n✅ Remotion site deployed successfully!");
  console.log("\nSite details:");
  console.log("  Name:", siteName);
  console.log("  Serve URL:", serveUrl);
  console.log("  Bucket:", bucketName);
  console.log("  Region:", REGION);
  console.log("\nYou can now render videos using this site!");
  
} catch (error) {
  console.error("\n\n❌ Failed to deploy Remotion site");
  console.error("Error:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Check your AWS credentials in .env file");
  console.error("2. Verify IAM permissions (see AWS_IAM_SETUP.md)");
  console.error("3. Ensure the entry point exists: components/editor/version-7.0.0/remotion/index.ts");
  console.error("4. Check network connectivity");
  process.exit(1);
}

