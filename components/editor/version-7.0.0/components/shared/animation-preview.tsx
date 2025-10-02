import React, { useState } from "react";
import { AnimationTemplate } from "../../templates/animation-templates";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../ui/collapsible";

/**
 * AnimationPreviewProps interface defines the required props for the AnimationPreview component
 */
interface AnimationPreviewProps {
  /** Unique identifier for the animation */
  animationKey: string;
  /** Animation template containing enter/exit animations and configuration */
  animation: AnimationTemplate;
  /** Whether this animation is currently selected */
  isSelected: boolean;
  /** Callback function triggered when the animation is clicked */
  onClick: () => void;
}

/**
 * AnimationPreview component displays an interactive preview of an animation effect.
 * It shows a circular element that demonstrates the animation on hover and provides
 * visual feedback for selection state.
 *
 * @component
 * @param {AnimationTemplate} animation - The animation template to preview
 * @param {boolean} isSelected - Whether this animation is currently selected
 * @param {() => void} onClick - Callback function when the animation is selected
 *
 * @example
 * ```tsx
 * <AnimationPreview
 *   animationKey="fade"
 *   animation={fadeAnimation}
 *   isSelected={false}
 *   onClick={() => handleAnimationSelect('fade')}
 * />
 * ```
 */
export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  animation,
  isSelected,
  onClick,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const getAnimationStyle = () => {
    const styles = animation.enter?.(isHovering ? 40 : 0, 40) || {};
    return {
      ...styles,
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative aspect-square w-full rounded-lg border ${
        isSelected
          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
          : "border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/10 dark:bg-muted/30 dark:hover:bg-muted/50"
      } p-3 transition-all duration-200 group backdrop-blur-sm`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-0 sm:gap-3">
        {/* Container for animation circles with subtle glow effect */}
        <div className="relative h-6 w-6">
          {/* Static circle with fade out */}
          <div
            className={`absolute inset-0 rounded-full ${
              isSelected
                ? "border-blue-500 border-dashed border-2"
                : "border-foreground/30 dark:border-foreground/50 border-[1.5px]"
            } transition-all duration-500 h-6`}
            style={{
              opacity: isHovering ? 0 : 0.8,
            }}
          />
          {/* Animated circle with fade in */}
          {animation.name !== "None" && (
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-foreground/30 dark:border-foreground/50 transition-all duration-500 h-6"
              style={{
                ...getAnimationStyle(),
                opacity: isHovering ? 0.9 : 0,
                boxShadow: isHovering ? "0 0 10px rgba(0,0,0,0.1)" : "none",
              }}
            />
          )}
        </div>

        <span
          className={`mt-4 text-[7px] tracking-wide transition-all duration-200 ${
            isSelected
              ? "text-blue-500"
              : "text-muted-foreground/80 group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground"
          }`}
        >
          {animation.name}
        </span>
      </div>
    </button>
  );
};

/**
 * Interface for the AnimationSection component that displays a collapsible section of animations
 */
interface AnimationSectionProps {
  /** Title for the section */
  title: string;
  /** Count of animations in this section */
  count: number;
  /** Whether the section is currently expanded */
  isOpen: boolean;
  /** Function to toggle the section's expanded state */
  onToggle: () => void;
  /** Animation previews to display in this section */
  children: React.ReactNode;
}

/**
 * AnimationSection displays a collapsible section of animations with a title and count
 */
const AnimationSection: React.FC<AnimationSectionProps> = ({
  title,
  count,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className="w-full mb-4 px-0 mx-0"
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <CollapsibleTrigger className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center">
            <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
              {title}
            </span>
            <span className="ml-2 text-[10px] px-[5.2px] py-0.5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400">
              {count}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-2 bg-white dark:bg-gray-900/50">
            <div className="grid grid-cols-4 gap-3">{children}</div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/**
 * Interface for AnimationSettings component
 */
interface AnimationSettingsProps {
  /** Animation templates to display */
  animations: Record<string, AnimationTemplate>;
  /** Currently selected enter animation */
  selectedEnterAnimation?: string;
  /** Currently selected exit animation */
  selectedExitAnimation?: string;
  /** Callback for when an enter animation is selected */
  onEnterAnimationSelect: (key: string) => void;
  /** Callback for when an exit animation is selected */
  onExitAnimationSelect: (key: string) => void;
  /** Optional class name for additional styling */
  className?: string;
}

/**
 * AnimationSettings component provides a unified interface for selecting enter and exit animations
 * using a collapsible accordion for organization
 */
export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  animations,
  selectedEnterAnimation = "none",
  selectedExitAnimation = "none",
  onEnterAnimationSelect,
  onExitAnimationSelect,
  className = "",
}) => {
  // State to track which sections are open - Enter is open by default, Exit is closed
  const [openSections, setOpenSections] = useState({
    enter: true,
    exit: false,
  });

  // Calculate the count of animations (excluding the "None" option that we add)
  const animationCount = Object.keys(animations).length;

  // Toggle function for opening/closing sections
  const toggleSection = (section: "enter" | "exit") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Create the "None" animation option
  const noneAnimation: AnimationTemplate = {
    name: "None",
    preview: "No animation",
    enter: () => ({}),
    exit: () => ({}),
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="rounded-md bg-gray-100/50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3.5">
          Animations
        </h3>

        {/* Enter Animation Section */}
        <AnimationSection
          title="Enter Animation"
          count={animationCount}
          isOpen={openSections.enter}
          onToggle={() => toggleSection("enter")}
        >
          <AnimationPreview
            animationKey="none"
            animation={noneAnimation}
            isSelected={selectedEnterAnimation === "none"}
            onClick={() => onEnterAnimationSelect("none")}
          />
          {Object.entries(animations).map(([key, animation]) => (
            <AnimationPreview
              key={`enter-${key}`}
              animationKey={key}
              animation={animation}
              isSelected={selectedEnterAnimation === key}
              onClick={() => onEnterAnimationSelect(key)}
            />
          ))}
        </AnimationSection>

        {/* Exit Animation Section */}
        <AnimationSection
          title="Exit Animation"
          count={animationCount}
          isOpen={openSections.exit}
          onToggle={() => toggleSection("exit")}
        >
          <AnimationPreview
            animationKey="none"
            animation={noneAnimation}
            isSelected={selectedExitAnimation === "none"}
            onClick={() => onExitAnimationSelect("none")}
          />
          {Object.entries(animations).map(([key, animation]) => (
            <AnimationPreview
              key={`exit-${key}`}
              animationKey={key}
              animation={animation}
              isSelected={selectedExitAnimation === key}
              onClick={() => onExitAnimationSelect(key)}
            />
          ))}
        </AnimationSection>
      </div>
    </div>
  );
};
