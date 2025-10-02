import React, { memo, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorContext } from "../../../contexts/editor-context";
import { Overlay, OverlayType, StickerCategory } from "../../../types";
import {
  templatesByCategory,
  getStickerCategories,
} from "../../../templates/sticker-templates/sticker-helpers";
import { useTimelinePositioning } from "../../../hooks/use-timeline-positioning";
import { useTimeline } from "../../../contexts/timeline-context";
import { Player } from "@remotion/player";
import { Sequence } from "remotion";
import { useIsMobile } from "@/hooks/use-mobile";

// Wrapper component for sticker preview with static frame
const StickerPreview = memo(
  ({ template, onClick }: { template: any; onClick: () => void }) => {
    const playerRef = useRef<any>(null);
    const { Component } = template;

    const stickerDuration =
      template.config.defaultProps?.durationInFrames || 100;

    const previewProps = {
      overlay: {
        id: -1,
        type: OverlayType.STICKER,
        content: template.config.id,
        category: template.config.category as StickerCategory,
        durationInFrames: stickerDuration,
        from: 0,
        height: 100,
        width: 200,
        left: 0,
        top: 0,
        row: 0,
        isDragging: false,
        rotation: 0,
        styles: {
          opacity: 1,
          ...template.config.defaultProps?.styles,
        },
      },
      isSelected: false,
      ...template.config.defaultProps,
    };

    const MemoizedComponent = memo(Component);

    const PreviewComponent = () => (
      <Sequence from={0} durationInFrames={stickerDuration}>
        <MemoizedComponent {...previewProps} />
      </Sequence>
    );

    const handleMouseEnter = useCallback(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
      }
    }, []);

    const handleMouseLeave = useCallback(() => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.seekTo(15);
      }
    }, []);

    return (
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          group relative w-full h-full
          rounded-lg bg-gray-100/40 dark:bg-gray-800/40
          border border-gray-800/10 dark:border-gray-700/10
          hover:border-blue-500/20 dark:hover:border-blue-500/20
          hover:bg-blue-500/5 dark:hover:bg-blue-500/5
          transition-all duration-200 overflow-hidden
          ${template.config.isPro ? "relative" : ""}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Player
            ref={playerRef}
            component={PreviewComponent}
            durationInFrames={stickerDuration}
            compositionWidth={template.config.layout === "double" ? 280 : 140}
            compositionHeight={140}
            fps={30}
            initialFrame={15}
            autoPlay={false}
            loop
            controls={false}
            style={{
              width: template.config.layout === "double" ? "100%" : "140px",
              height: "140px",
            }}
          />
        </div>
      </button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.template.config.id === nextProps.template.config.id
);

StickerPreview.displayName = "StickerPreview";

export function StickersPanel() {
  const { addOverlay, overlays, durationInFrames } = useEditorContext();
  const { findNextAvailablePosition } = useTimelinePositioning();
  const { visibleRows } = useTimeline();
  const stickerCategories = getStickerCategories();
  const isMobile = useIsMobile();

  const handleStickerClick = useCallback(
    (templateId: string) => {
      const template = Object.values(templatesByCategory)
        .flat()
        .find((t) => t.config.id === templateId);

      if (!template) return;

      const { from, row } = findNextAvailablePosition(
        overlays,
        visibleRows,
        durationInFrames
      );

      const newOverlay: Overlay = {
        id: Date.now(),
        type: OverlayType.STICKER,
        content: template.config.id,
        category: template.config.category as StickerCategory,
        durationInFrames: 50,
        from,
        height: 150,
        width: 150,
        left: 0,
        top: 0,
        row,
        isDragging: false,
        rotation: 0,
        styles: {
          opacity: 1,
          zIndex: 1,
          ...template.config.defaultProps?.styles,
        },
      };

      addOverlay(newOverlay);
    },
    [
      addOverlay,
      overlays,
      visibleRows,
      durationInFrames,
      findNextAvailablePosition,
    ]
  );

  const renderStickerContent = (category: string) => (
    <div className="grid grid-cols-2 gap-3 pt-3 pb-3">
      {templatesByCategory[category]?.map((template) => (
        <div
          key={template.config.id}
          className={`
            h-[140px]
            ${template.config.layout === "double" ? "col-span-2" : ""}
          `}
        >
          <StickerPreview
            template={template}
            onClick={() => handleStickerClick(template.config.id)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900/50 h-full">
      <Tabs defaultValue={stickerCategories[0]} className="w-full">
        <TabsList className="w-full flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
          {stickerCategories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex-1 px-3 py-1.5 text-sm font-medium
                data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800
                data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                data-[state=active]:shadow-sm
                rounded-md transition-all duration-200
                text-gray-600 dark:text-gray-400"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {stickerCategories.map((category) => (
          <TabsContent key={category} value={category} className="mt-2">
            {isMobile ? (
              renderStickerContent(category)
            ) : (
              <ScrollArea className="h-[calc(100vh-140px)]">
                {renderStickerContent(category)}
              </ScrollArea>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
