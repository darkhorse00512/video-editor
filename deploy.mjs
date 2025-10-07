import {
  deployFunction,
  deploySite,
  getOrCreateBucket,
} from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import { RAM, REGION, SITE_NAME, TIMEOUT, DISK } from "./config.mjs";

/**
 * This script deploys the Remotion video rendering infrastructure to AWS Lambda.
 * It sets up three main components:
 * 1. Lambda Function - For serverless video rendering
 * 2. S3 Bucket - For storing rendered videos and assets
 * 3. Remotion Site - The video template that will be rendered
 */

console.log("Selected region:", REGION);
dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
  console.log(
    'The environment variable "REMOTION_AWS_ACCESS_KEY_ID" is not set.'
  );
  console.log("Lambda renders were not set up.");
  console.log(
    "Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup"
  );
  process.exit(0);
}
if (
  !process.env.AWS_SECRET_ACCESS_KEY &&
  !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
) {
  console.log(
    'The environment variable "REMOTION_REMOTION_AWS_SECRET_ACCESS_KEY" is not set.'
  );
  console.log("Lambda renders were not set up.");
  console.log(
    "Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup"
  );
  process.exit(0);
}

process.stdout.write("Deploying Lambda function... ");

let functionName, functionAlreadyExisted;
let deployAttempts = 0;
const MAX_DEPLOY_ATTEMPTS = 3;

while (deployAttempts < MAX_DEPLOY_ATTEMPTS) {
  try {
    const result = await deployFunction({
      createCloudWatchLogGroup: true,
      memorySizeInMb: RAM,
      region: REGION,
      timeoutInSeconds: TIMEOUT,
      diskSizeInMb: DISK,
    });
    functionName = result.functionName;
    functionAlreadyExisted = result.alreadyExisted;
    break;
  } catch (error) {
    deployAttempts++;
    if (deployAttempts >= MAX_DEPLOY_ATTEMPTS) {
      console.error("\n\nFailed to deploy Lambda function after", MAX_DEPLOY_ATTEMPTS, "attempts");
      console.error("Error:", error.message);
      console.error("\nTroubleshooting tips:");
      console.error("1. Check your internet connection");
      console.error("2. Verify AWS credentials are correct");
      console.error("3. Check if you're behind a proxy/firewall");
      console.error("4. Try again with a more stable network connection");
      process.exit(1);
    }
    console.log(`\nAttempt ${deployAttempts} failed, retrying...`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
  }
}

console.log(
  functionName,
  functionAlreadyExisted ? "(already existed)" : "(created)"
);

process.stdout.write("Ensuring bucket... ");
const { bucketName, alreadyExisted: bucketAlreadyExisted } =
  await getOrCreateBucket({
    region: REGION,
  });
console.log(
  bucketName,
  bucketAlreadyExisted ? "(already existed)" : "(created)"
);

process.stdout.write("Deploying site... ");
const { siteName } = await deploySite({
  bucketName,
  entryPoint: path.join(process.cwd(), "components", "editor", "version-7.0.0", "remotion", "index.ts"),
  siteName: SITE_NAME,
  region: REGION,
});

console.log(siteName);

console.log();
console.log("You now have everything you need to render videos!");
console.log("Re-run this command when:");
console.log("  1) you changed the video template");
console.log("  2) you changed config.mjs");
console.log("  3) you upgraded Remotion to a newer version");

/**
 * After running this script:
 * - A Lambda function will be created/updated for rendering videos
 * - An S3 bucket will be created/verified for storage
 * - The Remotion site (video template) will be deployed
 *
 * The script should be re-run when:
 * 1. The video template code is modified
 * 2. Configuration in config.mjs changes
 * 3. Remotion is upgraded to a new version
 */
