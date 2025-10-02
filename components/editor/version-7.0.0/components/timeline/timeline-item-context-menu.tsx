import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2, Copy, Scissors } from "lucide-react";

/**
 * Props for the TimelineItemContextMenu component
 */
interface TimelineItemContextMenuProps {
  /** The content to wrap with the context menu */
  children: React.ReactNode;
  /** Callback fired when the context menu opens or closes */
  onOpenChange: (open: boolean) => void;
  /** Callback to delete the timeline item */
  onDeleteItem: (id: number) => void;
  /** Callback to duplicate the timeline item */
  onDuplicateItem: (id: number) => void;
  /** Callback to split the timeline item */
  onSplitItem: (id: number) => void;
  /** ID of the timeline item this menu belongs to */
  itemId: number;
}

/**
 * A context menu component for timeline items that provides delete, duplicate and split actions.
 * The menu is triggered by right-clicking on the wrapped children element.
 *
 * @example
 * ```tsx
 * <TimelineItemContextMenu
 *   itemId={1}
 *   onDeleteItem={handleDelete}
 *   onDuplicateItem={handleDuplicate}
 *   onSplitItem={handleSplit}
 *   onOpenChange={handleOpenChange}
 * >
 *   <TimelineItem />
 * </TimelineItemContextMenu>
 * ```
 */
export const TimelineItemContextMenu: React.FC<
  TimelineItemContextMenuProps
> = ({
  children,
  onOpenChange,
  onDeleteItem,
  onDuplicateItem,
  onSplitItem,
  itemId,
}) => {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger className="z-[100]">{children}</ContextMenuTrigger>
      <ContextMenuContent className="dark:bg-slate-900 dark:border-slate-800">
        <ContextMenuItem
          className="dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:text-slate-200"
          onClick={() => onDeleteItem(itemId)}
        >
          <Trash2 className="mr-4 h-4 w-4" />
          Delete
        </ContextMenuItem>
        <ContextMenuItem
          className="dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:text-slate-200"
          onClick={() => onDuplicateItem(itemId)}
        >
          <Copy className="mr-4 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem
          className="dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:text-slate-200"
          onClick={() => onSplitItem(itemId)}
        >
          <Scissors className="mr-4 h-4 w-4" />
          Split
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
