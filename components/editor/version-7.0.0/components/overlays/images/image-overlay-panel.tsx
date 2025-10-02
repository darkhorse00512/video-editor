import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEditorContext } from "../../../contexts/editor-context";
import { useTimelinePositioning } from "../../../hooks/use-timeline-positioning";
import { useAspectRatio } from "../../../hooks/use-aspect-ratio";
import { useTimeline } from "../../../contexts/timeline-context";
import { ImageOverlay, Overlay, OverlayType } from "../../../types";
import { ImageDetails } from "./image-details";
import { usePexelsImages } from "../../../hooks/use-pexels-images";

/**
 * Interface representing an image from the Pexels API
 */
interface PexelsImage {
  id: number | string;
  src: {
    original: string;
    medium: string;
  };
}

/**
 * ImageOverlayPanel Component
 *
 * A panel that provides functionality to:
 * 1. Search and select images from Pexels
 * 2. Add selected images as overlays to the editor
 * 3. Modify existing image overlay properties
 *
 * The panel has two main states:
 * - Search/Selection mode: Shows a search bar and grid of Pexels images
 * - Edit mode: Shows image details editor when an existing image overlay is selected
 */
export const ImageOverlayPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { images, isLoading, fetchImages } = usePexelsImages();
  const {
    addOverlay,
    overlays,
    durationInFrames,
    selectedOverlayId,
    changeOverlay,
  } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { getAspectRatioDimensions } = useAspectRatio();
  const { visibleRows } = useTimeline();
  const [localOverlay, setLocalOverlay] = useState<Overlay | null>(null);

  useEffect(() => {
    if (selectedOverlayId === null) {
      setLocalOverlay(null);
      return;
    }

    const selectedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (selectedOverlay?.type === OverlayType.IMAGE) {
      setLocalOverlay(selectedOverlay);
    }
  }, [selectedOverlayId, overlays]);

  /**
   * Handles the image search form submission
   * Triggers the Pexels API call with the current search query
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchImages(searchQuery);
    }
  };

  /**
   * Adds a new image overlay to the editor
   * @param image - The selected Pexels image to add
   * Creates a new overlay with default positioning and animation settings
   */
  const handleAddImage = (image: PexelsImage) => {
    const { width, height } = getAspectRatioDimensions();
    const { from, row } = findNextAvailablePosition(
      overlays,
      visibleRows,
      durationInFrames
    );

    const newOverlay: Overlay = {
      left: 0,
      top: 0,
      width,
      height,
      durationInFrames: 200,
      from,
      id: Date.now(),
      rotation: 0,
      row,
      isDragging: false,
      type: OverlayType.IMAGE,
      src: image.src.original,
      styles: {
        objectFit: "cover",
        animation: {
          enter: "fadeIn",
          exit: "fadeOut",
        },
      },
    };

    console.log(newOverlay);

    addOverlay(newOverlay);
  };

  /**
   * Updates an existing image overlay's properties
   * @param updatedOverlay - The modified overlay object
   * Updates both local state and global editor context
   */
  const handleUpdateOverlay = (updatedOverlay: Overlay) => {
    setLocalOverlay(updatedOverlay);
    changeOverlay(updatedOverlay.id, updatedOverlay);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900/50 h-full">
      {!localOverlay ? (
        <>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search images..."
              value={searchQuery}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-400"
              onChange={(e) => setSearchQuery(e.target.value)}
              // NOTE: Stops zooming in on input focus on iPhone
              style={{ fontSize: "16px" }}
            />
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="bg-background hover:bg-muted text-foreground border-border"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative aspect-video bg-muted animate-pulse rounded-sm"
                />
              ))
            ) : images.length > 0 ? (
              images.map((image) => (
                <button
                  key={image.id}
                  className="relative aspect-video cursor-pointer border border-border hover:border-foreground rounded-md"
                  onClick={() => handleAddImage(image)}
                >
                  <div className="relative">
                    <img
                      src={image.src.medium}
                      alt={`Image thumbnail ${image.id}`}
                      className="rounded-sm object-cover w-full h-full hover:opacity-60 transition-opacity duration-200"
                    />
                    <div className="absolute inset-0 bg-background/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-muted-foreground"></div>
            )}
          </div>
        </>
      ) : (
        <ImageDetails
          localOverlay={localOverlay as ImageOverlay}
          setLocalOverlay={handleUpdateOverlay}
        />
      )}
    </div>
  );
};
