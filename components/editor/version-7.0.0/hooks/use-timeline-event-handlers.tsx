import { useCallback } from "react";

interface UseTimelineEventHandlersProps {
  // Callback function to handle drag movement with x and y coordinates
  handleDrag: (clientX: number, clientY: number) => void;
  // Callback function to handle when dragging ends
  handleDragEnd: () => void;
  // Boolean flag indicating if currently dragging
  isDragging: boolean;
  // Reference to the timeline DOM element
  timelineRef: React.RefObject<HTMLDivElement>;
  // Function to update the position of the ghost marker (preview)
  setGhostMarkerPosition: (position: number | null) => void;
}

export const useTimelineEventHandlers = ({
  handleDrag,
  handleDragEnd,
  isDragging,
  timelineRef,
  setGhostMarkerPosition,
}: UseTimelineEventHandlersProps) => {
  // Handle mouse movement over the timeline
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        // Call handleDrag directly
        handleDrag(e.clientX, e.clientY);
      } else {
        // If not dragging, show ghost marker as hover preview
        const rect = timelineRef.current?.getBoundingClientRect();
        if (rect) {
          const position = ((e.clientX - rect.left) / rect.width) * 100;
          setGhostMarkerPosition(position);
        }
      }
    },
    // Update dependencies
    [isDragging, handleDrag, timelineRef, setGhostMarkerPosition]
  );

  // Handle touch movement for mobile devices
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (isDragging) {
        // Call handleDrag directly
        const touch = e.touches[0];
        handleDrag(touch.clientX, touch.clientY);
      }
    },
    // Update dependencies
    [isDragging, handleDrag]
  );

  // Handle when mouse leaves the timeline area
  const handleTimelineMouseLeave = useCallback(() => {
    // Remove ghost marker when mouse leaves
    setGhostMarkerPosition(null);
    // If was dragging, end the drag operation
    if (isDragging) {
      handleDragEnd();
    }
  }, [isDragging, handleDragEnd, setGhostMarkerPosition]);

  // Return event handlers for use in the component
  return {
    handleMouseMove,
    handleTouchMove,
    handleTimelineMouseLeave,
  };
};
