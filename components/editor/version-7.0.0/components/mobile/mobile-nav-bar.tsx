"use client";

import * as React from "react";
import {
  Film,
  Music,
  Type,
  Subtitles,
  ImageIcon,
  FolderOpen,
  Sticker,
  Layout,
  Plus,
  X,
} from "lucide-react";
import { useSidebar } from "../../contexts/sidebar-context";
import { OverlayType } from "../../types";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useEffect, useState, useRef } from "react";
import { VideoOverlayPanel } from "../overlays/video/video-overlay-panel";
import { TextOverlaysPanel } from "../overlays/text/text-overlays-panel";
import SoundsPanel from "../overlays/sounds/sounds-panel";
import { CaptionsPanel } from "../overlays/captions/captions-panel";
import { ImageOverlayPanel } from "../overlays/images/image-overlay-panel";
import { StickersPanel } from "../overlays/stickers/stickers-panel";
import { LocalMediaPanel } from "../overlays/local-media/local-media-panel";
import { TemplateOverlayPanel } from "../overlays/templates/template-overlay-panel";

/**
 * MobileNavBar Component
 *
 * A compact mobile-only navigation bar that displays overlay type icons
 * with a horizontal scrollable interface. Designed to match the TimelineControls
 * visual style while remaining compact for mobile screens.
 */
export function MobileNavBar() {
  const { activePanel, setActivePanel } = useSidebar();
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollWidth = () => {
      if (scrollableRef.current) {
        const { scrollWidth, clientWidth } = scrollableRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScrollWidth();
    window.addEventListener("resize", checkScrollWidth);
    return () => window.removeEventListener("resize", checkScrollWidth);
  }, []);

  // Scroll active item into view when it changes
  useEffect(() => {
    if (activePanel && scrollableRef.current) {
      const activeItem = scrollableRef.current.querySelector(
        `[data-panel="${activePanel}"]`
      ) as HTMLElement;

      if (activeItem) {
        // Calculate the scroll position to center the active item
        const containerWidth = scrollableRef.current.offsetWidth;
        const itemLeft = activeItem.offsetLeft;
        const itemWidth = activeItem.offsetWidth;
        const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

        scrollableRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activePanel]);

  // Use shorter names on mobile
  const getPanelTitle = (type: OverlayType): string => {
    switch (type) {
      case OverlayType.VIDEO:
        return "Video";
      case OverlayType.TEXT:
        return "Text";
      case OverlayType.SOUND:
        return "Audio";
      case OverlayType.CAPTION:
        return "Caption";
      case OverlayType.IMAGE:
        return "Image";
      case OverlayType.LOCAL_DIR:
        return "Media";
      case OverlayType.STICKER:
        return "Sticker";
      case OverlayType.TEMPLATE:
        return "Template";
      default:
        return "Unknown";
    }
  };

  const navigationItems = [
    {
      title: getPanelTitle(OverlayType.VIDEO),
      url: "#",
      icon: Film,
      panel: OverlayType.VIDEO,
      type: OverlayType.VIDEO,
    },
    {
      title: getPanelTitle(OverlayType.TEXT),
      url: "#",
      icon: Type,
      panel: OverlayType.TEXT,
      type: OverlayType.TEXT,
    },
    {
      title: getPanelTitle(OverlayType.SOUND),
      url: "#",
      icon: Music,
      panel: OverlayType.SOUND,
      type: OverlayType.SOUND,
    },
    {
      title: getPanelTitle(OverlayType.CAPTION),
      url: "#",
      icon: Subtitles,
      panel: OverlayType.CAPTION,
      type: OverlayType.CAPTION,
    },
    {
      title: getPanelTitle(OverlayType.IMAGE),
      url: "#",
      icon: ImageIcon,
      panel: OverlayType.IMAGE,
      type: OverlayType.IMAGE,
    },
    {
      title: getPanelTitle(OverlayType.STICKER),
      url: "#",
      icon: Sticker,
      panel: OverlayType.STICKER,
      type: OverlayType.STICKER,
    },
    {
      title: getPanelTitle(OverlayType.LOCAL_DIR),
      url: "#",
      icon: FolderOpen,
      panel: OverlayType.LOCAL_DIR,
      type: OverlayType.LOCAL_DIR,
    },
    {
      title: getPanelTitle(OverlayType.TEMPLATE),
      url: "#",
      icon: Layout,
      panel: OverlayType.TEMPLATE,
      type: OverlayType.TEMPLATE,
    },
  ];

  /**
   * Renders the appropriate panel component based on the active panel selection
   * @returns {React.ReactNode} The component corresponding to the active panel
   */
  const renderActivePanel = () => {
    switch (activePanel) {
      case OverlayType.TEXT:
        return <TextOverlaysPanel />;
      case OverlayType.SOUND:
        return <SoundsPanel />;
      case OverlayType.VIDEO:
        return <VideoOverlayPanel />;
      case OverlayType.CAPTION:
        return <CaptionsPanel />;
      case OverlayType.IMAGE:
        return <ImageOverlayPanel />;
      case OverlayType.STICKER:
        return <StickersPanel />;
      case OverlayType.LOCAL_DIR:
        return <LocalMediaPanel />;
      case OverlayType.TEMPLATE:
        return <TemplateOverlayPanel />;
      default:
        return null;
    }
  };

  const handleItemClick = (item: any) => {
    // Set the clicked item ID for animation
    setClickedItemId(item.title);

    // Clear the animation after it completes
    setTimeout(() => setClickedItemId(null), 300);

    // Set the active panel and open the bottom sheet
    setActivePanel(item.panel);
    setIsSheetOpen(true);
  };

  return (
    <>
      <div className="md:hidden flex flex-col border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="relative flex-1 flex">
          {/* Left fade gradient to indicate scrollable content */}
          {showScrollIndicator && (
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent dark:from-gray-900/90 z-10 pointer-events-none" />
          )}

          <div
            ref={scrollableRef}
            className={`flex-1 flex items-center overflow-x-auto scrollbar-hide px-1 py-2 overflow-auto gap-1.5 relative`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {navigationItems.map((item) => (
              <TooltipProvider key={item.title} delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      data-panel={item.panel}
                      onClick={() => handleItemClick(item)}
                      className={`rounded flex flex-col items-center px-2 py-1.5
                      ${
                        clickedItemId === item.title
                          ? "scale-95 opacity-80"
                          : ""
                      }
                      ${
                        activePanel === item.panel
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm"
                          : "text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } transition-all`}
                    >
                      <item.icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            ))}

            {/* "More" indicator button for discoverability */}
            {showScrollIndicator && (
              <button
                onClick={() => {
                  if (scrollableRef.current) {
                    scrollableRef.current.scrollBy({
                      left: 100,
                      behavior: "smooth",
                    });
                  }
                }}
                className="flex items-center justify-center h-9 min-w-9 px-2 rounded bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right fade gradient to indicate scrollable content */}
          {showScrollIndicator && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/90 z-10 pointer-events-none" />
          )}
        </div>

        {/* Bottom swipe indicator for the pane */}
        {isSheetOpen && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pointer-events-none">
            <div className="h-1 w-10 bg-gray-300 dark:bg-gray-700 rounded-full opacity-50" />
          </div>
        )}
      </div>

      {/* Bottom Sheet for Mobile */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="pt-4 h-[70vh] rounded-t-xl pb-0 px-0 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pb-3 border-b">
              <SheetTitle className="text-left text-lg font-light">
                {activePanel && getPanelTitle(activePanel)}
              </SheetTitle>
              <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-0">
              {renderActivePanel()}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
