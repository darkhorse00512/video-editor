/**
 * Props for the GapIndicator component
 */
interface GapIndicatorProps {
  /** The gap object containing start and end timestamps */
  gap: { start: number; end: number };
  /** The index of the row where this gap appears */
  rowIndex: number;
  /** The total duration of the timeline in milliseconds */
  totalDuration: number;
  /** Callback function to remove the gap */
  onRemoveGap?: (rowIndex: number, gapStart: number, gapEnd: number) => void;
}

/**
 * A component that displays a visual indicator for gaps in a timeline.
 * It shows a striped pattern on hover and includes a close button to remove the gap.
 * The width and position of the indicator are calculated as percentages of the total duration.
 *
 * @param props - The component props
 * @param props.gap - Object containing start and end times of the gap
 * @param props.rowIndex - Index of the timeline row
 * @param props.totalDuration - Total duration of the timeline
 * @param props.onRemoveGap - Optional callback to handle gap removal
 */
export default function GapIndicator({
  gap,
  rowIndex,
  totalDuration,
  onRemoveGap,
}: GapIndicatorProps) {
  return (
    <div
      className="absolute top-0 bottom-0 w-full h-full cursor-pointer group z-10"
      style={{
        left: `${(gap.start / totalDuration) * 100}%`,
        width: `${((gap.end - gap.start) / totalDuration) * 100}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onRemoveGap) {
          onRemoveGap(rowIndex, gap.start, gap.end);
        } else {
          console.warn(`No onRemoveGap handler for row ${rowIndex}`);
        }
      }}
    >
      <div
        className="absolute top-0 bottom-0 left-0 right-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            rgba(100, 116, 139, 0.02),
            rgba(100, 116, 139, 0.02) 8px,
            rgba(100, 116, 139, 0.05) 8px,
            rgba(100, 116, 139, 0.05) 16px
          )`,
          border: "1px dashed rgba(100, 116, 139, 0.2)",
        }}
      />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-0 bottom-0 left-0 right-0 w-full h-full flex items-center justify-center">
        <div className="bg-slate-900/60 dark:bg-black/70 rounded-full p-1.5 backdrop-blur-sm">
          <CloseIcon />
        </div>
      </div>
    </div>
  );
}

/**
 * A simple close icon component rendered as an SVG.
 * Used within the gap indicator to show the remove action.
 */
const CloseIcon = () => (
  <svg
    className="w-2.5 h-2.5 text-white dark:text-white/90"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
