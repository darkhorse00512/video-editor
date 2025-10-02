import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Handles media file deletion
 * 
 * This API endpoint:
 * 1. Receives a file path and user ID
 * 2. Verifies the file belongs to the user
 * 3. Deletes the file from the server
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, filePath } = await request.json();
    
    if (!userId || !filePath) {
      return NextResponse.json(
        { error: 'UserId and filePath are required' },
        { status: 400 }
      );
    }
    
    // Security check: Ensure the file path is within the user's directory
    const userDirPrefix = `/users/${userId}/`;
    if (!filePath.startsWith(userDirPrefix)) {
      return NextResponse.json(
        { error: 'Unauthorized file access' },
        { status: 403 }
      );
    }
    
    // Convert public path to server path
    const serverPath = path.join(process.cwd(), 'public', filePath);
    
    // Check if file exists
    if (!existsSync(serverPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete the file
    await unlink(serverPath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
