"use client";

import React, { useState, useRef } from "react";
import { useLocalMedia } from "../../contexts/local-media-context";
import { formatBytes, formatDuration } from "../../utils/format-utils";
import { Button } from "../../../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../ui/tabs";
import { Loader2, Upload, Trash2, Image, Video, Music } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../ui/dialog";

/**
 * User Media Gallery Component
 *
 * Displays the user's uploaded media files and provides functionality to:
 * - Upload new media files
 * - Filter media by type (image, video, audio)
 * - Preview media files
 * - Delete media files
 * - Add media to the timeline
 */
export function LocalMediaGallery({
  onSelectMedia,
}: {
  onSelectMedia?: (mediaFile: any) => void;
}) {
  const { localMediaFiles, addMediaFile, removeMediaFile, isLoading } =
    useLocalMedia();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter media files based on active tab
  const filteredMedia = localMediaFiles.filter((file) => {
    if (activeTab === "all") return true;
    return file.type === activeTab;
  });

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        setUploadError(null);
        await addMediaFile(files[0]);
        // Reset the input value to allow uploading the same file again
        event.target.value = "";
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadError("Failed to upload file. Please try again.");
        event.target.value = "";
      }
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle media selection
  const handleMediaSelect = (file: any) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  // Add media to timeline
  const handleAddToTimeline = () => {
    if (selectedFile && onSelectMedia) {
      onSelectMedia(selectedFile);
      setPreviewOpen(false);
    }
  };

  // Render preview content based on file type
  const renderPreviewContent = () => {
    if (!selectedFile) return null;

    const commonClasses =
      "max-h-[50vh] w-full object-contain rounded-lg shadow-sm";

    switch (selectedFile.type) {
      case "image":
        return (
          <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
            <img
              src={selectedFile.path}
              alt={selectedFile.name}
              className={`${commonClasses} object-contain`}
            />
          </div>
        );
      case "video":
        return (
          <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
            <video
              src={selectedFile.path}
              controls
              className={commonClasses}
              controlsList="nodownload"
              playsInline
            />
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <audio
              src={
                selectedFile.path.startsWith("http")
                  ? selectedFile.path
                  : `${window.location.origin}${selectedFile.path}`
              }
              controls
              className="w-[280px] max-w-full"
              controlsList="nodownload"
            />
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Unsupported file type
          </div>
        );
    }
  };

  // Render media item
  const renderMediaItem = (file: any) => {
    console.log(file);
    return (
      <div
        key={file.id}
        className="relative group/item border dark:border-gray-700 border-gray-200 rounded-md overflow-hidden cursor-pointer 
          hover:border-blue-500 dark:hover:border-blue-400 transition-all 
          bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md"
        onClick={() => handleMediaSelect(file)}
      >
        {/* Thumbnail */}
        <div className="aspect-video relative">
          {file.type === "image" && (
            <img
              src={file.thumbnail || file.path}
              alt={file.name}
              className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900"
            />
          )}
          {file.type === "video" && (
            <>
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900"
              />
              <div className="absolute bottom-1.5 right-1.5 bg-black/75 dark:bg-black/90 text-white text-xs px-1.5 py-0.5 rounded-md">
                {formatDuration(file.duration)}
              </div>
            </>
          )}
          {file.type === "audio" && (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <Music className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Media info */}
        <div className="p-2.5">
          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Delete button */}
        <button
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 
            text-white p-1.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-all duration-200 
            shadow-sm hover:shadow-md transform hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            removeMediaFile(file.id);
          }}
          title="Delete media"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm">Saved Uploads</h2>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleUploadClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*"
            disabled={isLoading}
          />
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {uploadError}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full grid grid-cols-4 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-sm border border-gray-200 dark:border-gray-700 gap-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">
              <Image className="w-3 h-3" />
              Images
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">
              <Video className="w-3 h-3" />
              Videos
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white 
            rounded-sm transition-all duration-200 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <span className="flex items-center gap-2 text-xs">
              <Music className="w-3 h-3" />
              Audio
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-sm text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Loading media files...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No media files</p>
                <p className="text-xs text-gray-500">
                  Upload your first media file to get started
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                className="text-xs"
              >
                Upload Media
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 ">
              {filteredMedia.map(renderMediaItem)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Media Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
            <DialogDescription>
              {selectedFile?.type} • {formatBytes(selectedFile?.size)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">{renderPreviewContent()}</div>
          <div className="flex justify-end mt-4">
            <Button variant="default" size="sm" onClick={handleAddToTimeline}>
              Add to Timeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
