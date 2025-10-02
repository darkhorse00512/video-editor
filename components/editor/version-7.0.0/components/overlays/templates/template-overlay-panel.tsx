import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "../../../contexts/editor-context";
import { TemplateOverlay } from "../../../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates } from "../../../hooks/use-templates";
import { TemplateThumbnail } from "./template-thumbnail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TemplateOverlayPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateOverlay | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { setOverlays, setAspectRatio } = useEditorContext();

  const { templates, isLoading, error } = useTemplates({
    searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the useTemplates hook
  };

  const handleApplyTemplate = (template: TemplateOverlay) => {
    // Replace all existing overlays with the template overlays
    const newOverlays = template.overlays.map((overlayTemplate, index) => ({
      ...overlayTemplate,
      // Generate new IDs for each overlay to avoid conflicts
      id: Math.floor(Math.random() * 1000000) + index,
    }));

    // Update the editor's timeline with the new overlays
    setOverlays(newOverlays);
    setConfirmDialogOpen(false);
    if (template.aspectRatio) {
      setAspectRatio(template.aspectRatio);
    }
  };

  const handleSelectTemplate = (template: TemplateOverlay) => {
    setSelectedTemplate(template);
    setConfirmDialogOpen(true);
  };

  const handleImportTemplate = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const template = JSON.parse(content) as TemplateOverlay;
      setSelectedTemplate(template);
      setConfirmDialogOpen(true);
    } catch (err) {
      console.error("Failed to import template:", err);
      // You might want to add proper error handling/notification here
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 sm:gap-4 sm:p-4 bg-gray-100/40 dark:bg-gray-900/40 h-full scrollbar-hide overflow-hidden">
      <>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-white/5 text-gray-900 dark:text-zinc-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-blue-400 md:text-base"
              onChange={(e) => setSearchQuery(e.target.value)}
              // NOTE: Stops zooming in on input focus on iPhone
              style={{ fontSize: "16px" }}
            />
          </form>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Import template"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs sm:text-sm p-2">
            Error loading templates: {error}
          </div>
        )}

        <ScrollArea className="flex-1 scrollbar-hide overflow-hidden [&_[data-radix-scroll-area-scrollbar]]:!hidden">
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 scrollbar-hide">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm"
                />
              ))
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent transition-colors duration-200"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader className="p-2 sm:p-3 space-y-2">
                    <div className="aspect-video w-full overflow-hidden rounded-md">
                      <TemplateThumbnail
                        thumbnail={template.thumbnail}
                        name={template.name}
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <CardTitle className="text-xs sm:text-sm font-light">
                        {template.name}
                      </CardTitle>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <div className="pt-1 sm:pt-2 border-t border-border">
                      <div className="flex flex-wrap float-left gap-1 sm:gap-2">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-sky-200 dark:bg-sky-400/30 rounded-sm text-[8px] sm:text-[9px] text-gray-800/70 dark:text-white"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex float-right gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span>
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center py-4 sm:py-8 text-gray-500 text-xs sm:text-sm">
                No templates found
              </div>
            )}
          </div>
        </ScrollArea>

        <AlertDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
        >
          <AlertDialogContent className="w-[90%] max-w-md mx-auto rounded-md p-3 sm:p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm sm:text-base">
                Apply Template
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm">
                Are you sure you want to add this template to your timeline? It
                will replace all existing overlays.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-3">
              <AlertDialogCancel className="h-8 sm:h-10 text-xs sm:text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="h-8 sm:h-10 text-xs sm:text-sm"
                onClick={() =>
                  selectedTemplate && handleApplyTemplate(selectedTemplate)
                }
              >
                Apply Template
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </div>
  );
};
