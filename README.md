# React Video Editor Pro

React Video Editor Pro is a powerful, web-based video editing tool built with React and Next.js. This project allows users to create and edit videos with features like timeline editing, text overlays, and sound integration.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/react-video-editor-pro.git
   ```

2. Navigate to the project directory:

   ```
   cd react-video-editor-pro
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Create a `.env.local` file in the root directory and add your configuration:

   ```
   NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
   NEXT_PUBLIC_DISABLE_RENDER=false
   ```

   **Environment Variables:**
   - `NEXT_PUBLIC_PEXELS_API_KEY`: Your Pexels API key for accessing stock videos and images
   - `NEXT_PUBLIC_DISABLE_RENDER`: Set to `"true"` to disable video rendering functionality (optional, defaults to false)

   You can obtain a free Pexels API key by:

   1. Going to https://www.pexels.com/api/
   2. Signing up for a Pexels account
   3. Copying your API key from the dashboard

5. Start the development server:

   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project is organized with version-specific components and pages:

- `/versions`: Contains markdown files for each version's changelog.
- `/app/versions`: Contains version-specific pages.
- `/components/editor`: Contains version-specific editor components.

### Version Files and Folders

Each version of the React Video Editor is contained in its own folder under `/components/editor`. For example, version 1.0.0 is located at `/components/editor/version-1.0.0/ReactVideoEditor.tsx`.

To create a new version:

1. Create a new folder under `/components/editor` with the version number.
2. Copy the latest version's `ReactVideoEditor.tsx` file into the new folder.
3. Make your changes and improvements to the new version.
4. Create a new page for the version under `/app/versions`.
5. Add a new markdown file in the `/versions` folder with the changelog for the new version.

## Video Rendering

This project uses [Remotion](https://www.remotion.dev/) for video rendering on AWS Lambda, providing a scalable and efficient solution for processing video edits.

### Remotion Setup

To enable video rendering capabilities:

1. **Set up AWS Credentials**:
   - Copy `env.example` to `.env` in your project root
   - Add your AWS Access Key ID and Secret Access Key
   - Get these from AWS Console -> IAM -> Users -> Your User -> Security Credentials

2. **Deploy Remotion Infrastructure**:
   ```bash
   npm run deploy
   ```
   This will deploy:
   - Lambda function for video rendering
   - S3 bucket for storing rendered videos
   - Remotion site to AWS S3

3. **Verify Deployment**:
   - The deploy script will output the deployed site name (usually "sams-site")
   - Check AWS S3 console to confirm the site was uploaded

For a detailed walkthrough of integrating Remotion with Next.js, check out:
- [This comprehensive guide](https://www.reactvideoeditor.com/blog/video-rendering-with-remotion-and-nextjs)
- [Our Remotion Setup Guide](./REMOTION_SETUP_GUIDE.md) - Step-by-step instructions for this project

### Common Issues

Video rendering can be tricky to get right initially. Some common pitfalls to watch out for:

- **"Access Denied" Error**: If you see "Access Denied" when trying to render, the Remotion site hasn't been deployed to S3 yet. Run `npm run deploy` to deploy the site.
- **Lambda Memory Issues**: The most common problem is insufficient memory allocation. Start with at least 2048MB and adjust based on your video processing needs.
- **Timeout Errors**: Complex renders may require increased Lambda timeout settings.
- **Asset Loading**: Ensure all assets (fonts, images, etc.) are properly uploaded and accessible to Lambda.
- **AWS Credentials**: Make sure your AWS credentials are properly set in the `.env` file.

Refer to the [Remotion documentation](https://www.remotion.dev/) for detailed troubleshooting guidance and best practices.

## Usage

The main page of the application displays a version changelog. Users can navigate to specific versions of the editor by clicking on the corresponding version link.

## License

This project is licensed under the React Video Editor Pro (RVE) License. For detailed terms and conditions, please visit our [License Page](https://www.reactvideoeditor.com/important/license).

### Licensing Requirements

React Video Editor Pro utilizes [Remotion](https://www.remotion.dev/) for video rendering capabilities. Please note:

1. For commercial use, you must obtain:

   - A React Video Editor Pro license
   - A separate Remotion license

2. The React Video Editor Pro license does not include Remotion licensing rights. For Remotion licensing information, please refer to their [official license terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

Ensure compliance with both licenses before deploying to production.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Remotion](https://www.remotion.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
