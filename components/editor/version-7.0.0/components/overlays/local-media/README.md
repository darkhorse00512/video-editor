# Local Media Feature

This feature allows users to upload and use their own media files (videos, images, audio) in the video editor.

## Features

- Upload videos, images, and audio files from your PC
- Organize media by type (videos, images, audio)
- Add uploaded media to the timeline with a single click
- View thumbnails and metadata for uploaded files
- Persist uploaded media between sessions using localStorage

## How to Use

1. Click on the "Local Media" icon in the sidebar
2. Click the "Upload Media" button to select files from your PC
3. Select one or multiple files to upload
4. Browse your uploaded media by type using the tabs
5. Click on any media item to add it to the timeline

## Technical Implementation

- Media files are stored in the browser using object URLs
- Thumbnails are generated for videos and images
- Media metadata (duration, size) is extracted when possible
- All uploaded media is persisted in localStorage
- Files can be removed individually when no longer needed

## Supported File Types

- Videos: MP4, WebM, Ogg, etc.
- Images: JPEG, PNG, GIF, WebP, etc.
- Audio: MP3, WAV, Ogg, etc.

## Notes

- Media is stored locally in the browser and not uploaded to any server
- Large files may impact browser performance
- Some file formats may not be supported by all browsers
