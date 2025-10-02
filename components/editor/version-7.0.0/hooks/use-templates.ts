import { useState, useEffect } from "react";
import { TemplateOverlay, Overlay, OverlayType } from "../types";
import { templateFiles } from "../templates/full-templates/index";

interface UseTemplatesOptions {
  /** Optional search query to filter templates by name, description, or tags */
  searchQuery?: string;
}

/**
 * A custom hook that manages the loading and filtering of video editor templates.
 *
 * This hook handles:
 * - Loading templates from the full-templates directory
 * - Filtering templates based on a search query
 * - Managing loading and error states
 * - Finding thumbnails from template overlays
 *
 * @param options - Configuration options for the hook
 * @param options.searchQuery - Optional search string to filter templates
 * @returns An object containing the filtered templates, loading state, error state, and refresh function
 */
export const useTemplates = ({
  searchQuery = "",
}: UseTemplatesOptions = {}) => {
  const [templates, setTemplates] = useState<TemplateOverlay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Finds a suitable thumbnail URL from a list of overlays.
   * Prioritizes video overlays first, then falls back to image overlays.
   *
   * @param overlays - Array of template overlays to search through
   * @returns The content URL of the first suitable overlay, or undefined if none found
   */
  const findThumbnailFromOverlays = (
    overlays: Overlay[]
  ): string | undefined => {
    // First try to find a video overlay
    const videoOverlay = overlays.find(
      (overlay) => overlay.type === OverlayType.VIDEO
    );
    if (videoOverlay && "content" in videoOverlay) {
      return videoOverlay.content;
    }

    // Then try to find an image overlay
    const imageOverlay = overlays.find(
      (overlay) => overlay.type === OverlayType.IMAGE
    );
    if (imageOverlay && "src" in imageOverlay) {
      return imageOverlay.src;
    }

    // Return undefined if no suitable thumbnail found
    return undefined;
  };

  // Load templates from the full-templates directory
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Import all template files dynamically
      const templateModules = await Promise.all(
        templateFiles.map(
          (filename) => import(`../templates/full-templates/${filename}`)
        )
      );

      const loadedTemplates = templateModules.map((templateModule) => {
        const templateData = templateModule.default;

        // Convert overlays with proper type handling
        const processedOverlays = templateData.overlays.map((overlay: any) => {
          const overlayType =
            overlay.type.toUpperCase() as keyof typeof OverlayType;
          const type = OverlayType[overlayType];

          return {
            ...overlay,
            type,
          } as Overlay;
        });

        // Create the template with proper typing
        const baseTemplate = {
          id: templateData.id,
          name: templateData.name,
          description: templateData.description,
          createdAt: templateData.createdAt,
          updatedAt: templateData.updatedAt,
          createdBy: templateData.createdBy,
          category: templateData.category,
          tags: templateData.tags,
          duration: templateData.duration,
          aspectRatio: templateData.aspectRatio,
          overlays: processedOverlays,
        };

        // Add thumbnail if it exists or find one from overlays
        const thumbnail =
          templateData.thumbnail ||
          findThumbnailFromOverlays(processedOverlays);

        const finalTemplate: TemplateOverlay = Object.assign(
          {},
          baseTemplate,
          thumbnail ? { thumbnail } : {}
        );
        return finalTemplate;
      });

      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
      console.error("Error loading templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    return (
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates: filteredTemplates,
    isLoading,
    error,
    refreshTemplates: loadTemplates,
  };
};
