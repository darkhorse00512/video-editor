import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Construct the path to the video file
  const videoPath = path.join(
    process.cwd(),
    "public",
    "rendered-videos",
    `${id}.mp4`
  );

  // Check if the file exists
  if (!fs.existsSync(videoPath)) {
    return new NextResponse("Video not found", { status: 404 });
  }

  // Read the file
  const videoBuffer = fs.readFileSync(videoPath);

  // Return the video with appropriate headers for download
  return new NextResponse(videoBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="rendered-video.mp4"`,
    },
  });
}
