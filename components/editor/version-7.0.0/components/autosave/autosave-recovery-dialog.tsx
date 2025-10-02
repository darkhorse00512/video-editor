import React from "react";
import { clearAutosave } from "../../utils/indexdb-helper";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface AutosaveRecoveryDialogProps {
  /**
   * Project ID of the autosave
   */
  projectId: string;

  /**
   * Timestamp of when the autosave was created
   */
  timestamp: number;

  /**
   * Function to call when user chooses to recover the autosave
   */
  onRecover: () => void;

  /**
   * Function to call when user chooses to discard the autosave
   */
  onDiscard: () => void;

  /**
   * Function to call when dialog is closed
   */
  onClose: () => void;
}

/**
 * Dialog component that prompts the user to recover an autosaved project
 */
export const AutosaveRecoveryDialog: React.FC<AutosaveRecoveryDialogProps> = ({
  projectId,
  timestamp,
  onRecover,
  onDiscard,
  onClose,
}) => {
  const { toast, dismiss } = useToast();
  const [toastId, setToastId] = React.useState<string>();
  const relativeTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  React.useEffect(() => {
    const { id } = toast({
      title: (
        <div className="flex items-center gap-2 text-base">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          Unsaved Changes Found
        </div>
      ) as any,
      description: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-light mt-1">
              We found an autosaved version of your project from{" "}
              <time
                dateTime={new Date(timestamp).toISOString()}
                className="font-medium"
              >
                {relativeTime}
              </time>{" "}
              ({new Date(timestamp).toLocaleTimeString()})
            </span>
          </div>
          <div className="flex gap-2">
            <ToastAction
              altText="Discard"
              onClick={handleDiscard}
              className="border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Discard
            </ToastAction>
            <Button
              variant="default"
              size="sm"
              onClick={handleRecover}
              className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              Recover Changes
            </Button>
          </div>
        </div>
      ),
      className:
        "shadow-[0_4px_20px_-1px] shadow-gray-400/50 border border-gray-300 bg-white text-gray-900 dark:shadow-gray-950/70 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
      onOpenChange: (open) => {
        if (!open) {
          handleDiscard();
        }
      },
    });
    setToastId(id);

    return () => {
      if (id) {
        dismiss(id);
      }
    };
  }, []);

  const handleRecover = async () => {
    try {
      if (toastId) {
        dismiss(toastId);
      }
      await onRecover();
    } finally {
      onClose();
    }
  };

  const handleDiscard = async () => {
    try {
      if (toastId) {
        dismiss(toastId);
      }
      await clearAutosave(projectId);
      onDiscard();
    } catch (error) {
      console.error("Failed to clear autosave:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear autosave data",
      });
    } finally {
      onClose();
    }
  };

  return null; // Component no longer renders its own UI
};
