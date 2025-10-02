import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  LocalMediaProvider,
  useLocalMedia,
} from "@/components/editor/version-7.0.0/contexts/local-media-context";
import {
  getUserMediaItems,
  deleteMediaItem,
  clearUserMedia,
} from "@/components/editor/version-7.0.0/utils/indexdb";
import {
  uploadMediaFile,
  deleteMediaFile,
} from "@/components/editor/version-7.0.0/utils/media-upload";
import { LocalMediaFile } from "@/components/editor/version-7.0.0/types";

// Mock all utility functions
jest.mock("@/components/editor/version-7.0.0/utils/user-id", () => ({
  getUserId: jest.fn(() => "test-user-id"),
}));

jest.mock("@/components/editor/version-7.0.0/utils/indexdb", () => ({
  getUserMediaItems: jest.fn(),
  deleteMediaItem: jest.fn(),
  clearUserMedia: jest.fn(),
}));

jest.mock("@/components/editor/version-7.0.0/utils/media-upload", () => ({
  uploadMediaFile: jest.fn(),
  deleteMediaFile: jest.fn(),
}));

describe("LocalMediaContext", () => {
  // Mock data
  const mockFile = new File(["test"], "test.mp4", { type: "video/mp4" });

  const mockMediaItem: {
    id: string;
    name: string;
    type: "video";
    serverPath: string;
    size: number;
    lastModified: number;
    thumbnail: string;
    duration: number;
  } = {
    id: "test-id-1",
    name: "test.mp4",
    type: "video",
    serverPath: "/uploads/test.mp4",
    size: 1024,
    lastModified: Date.now(),
    thumbnail: "thumbnail.jpg",
    duration: 10,
  };

  const mockLocalMediaFile: LocalMediaFile = {
    id: mockMediaItem.id,
    name: mockMediaItem.name,
    type: mockMediaItem.type,
    path: mockMediaItem.serverPath,
    size: mockMediaItem.size,
    lastModified: mockMediaItem.lastModified,
    thumbnail: mockMediaItem.thumbnail,
    duration: mockMediaItem.duration,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LocalMediaProvider>{children}</LocalMediaProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserMediaItems as jest.Mock).mockResolvedValue([mockMediaItem]);
    (uploadMediaFile as jest.Mock).mockResolvedValue(mockMediaItem);
    (deleteMediaFile as jest.Mock).mockResolvedValue(undefined);
    (deleteMediaItem as jest.Mock).mockResolvedValue(undefined);
    (clearUserMedia as jest.Mock).mockResolvedValue(undefined);
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useLocalMedia());
    }).toThrow("useLocalMedia must be used within a LocalMediaProvider");
  });

  describe("Initial Loading", () => {
    it("should load media files on mount", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      // Should start with loading state
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.localMediaFiles).toEqual([mockLocalMediaFile]);
      expect(getUserMediaItems).toHaveBeenCalledWith("test-user-id");
    });

    it("should handle loading error gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (getUserMediaItems as jest.Mock).mockRejectedValue(
        new Error("Load failed")
      );

      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.localMediaFiles).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("File Management", () => {
    it("should add new media file", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let addedFile: LocalMediaFile | undefined;
      await act(async () => {
        const response = await result.current.addMediaFile(mockFile);
        addedFile = response || undefined;
      });

      expect(uploadMediaFile).toHaveBeenCalledWith(mockFile);
      expect(addedFile).toEqual(mockLocalMediaFile);
      expect(result.current.localMediaFiles).toContainEqual(mockLocalMediaFile);
    });

    it("should handle file upload error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (uploadMediaFile as jest.Mock).mockRejectedValue(
        new Error("Upload failed")
      );

      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.addMediaFile(mockFile)).rejects.toThrow(
        "Upload failed"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should remove media file", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.localMediaFiles).toHaveLength(1);
      });

      await act(async () => {
        await result.current.removeMediaFile(mockLocalMediaFile.id);
      });

      expect(deleteMediaFile).toHaveBeenCalledWith(
        "test-user-id",
        mockLocalMediaFile.path
      );
      expect(deleteMediaItem).toHaveBeenCalledWith(mockLocalMediaFile.id);
      expect(result.current.localMediaFiles).toHaveLength(0);
    });

    it("should handle file removal error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (deleteMediaFile as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.localMediaFiles).toHaveLength(1);
      });

      await act(async () => {
        await result.current.removeMediaFile(mockLocalMediaFile.id);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should clear all media files", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.localMediaFiles).toHaveLength(1);
      });

      await act(async () => {
        await result.current.clearMediaFiles();
      });

      expect(deleteMediaFile).toHaveBeenCalledWith(
        "test-user-id",
        mockLocalMediaFile.path
      );
      expect(clearUserMedia).toHaveBeenCalledWith("test-user-id");
      expect(result.current.localMediaFiles).toHaveLength(0);
    });

    it("should handle clear all error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (clearUserMedia as jest.Mock).mockRejectedValue(
        new Error("Clear failed")
      );

      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.localMediaFiles).toHaveLength(1);
      });

      await act(async () => {
        await result.current.clearMediaFiles();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should update existing file when adding with same ID", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      await waitFor(() => {
        expect(result.current.localMediaFiles).toHaveLength(1);
      });

      const updatedMediaItem = {
        ...mockMediaItem,
        name: "updated.mp4",
      };
      (uploadMediaFile as jest.Mock).mockResolvedValueOnce(updatedMediaItem);

      await act(async () => {
        await result.current.addMediaFile(mockFile);
      });

      expect(result.current.localMediaFiles).toHaveLength(1);
      expect(result.current.localMediaFiles[0].name).toBe("updated.mp4");
    });
  });

  describe("Loading State", () => {
    it("should set loading state during operations", async () => {
      const { result } = renderHook(() => useLocalMedia(), { wrapper });

      // Initial loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Loading during file add
      act(() => {
        result.current.addMediaFile(mockFile);
      });
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
