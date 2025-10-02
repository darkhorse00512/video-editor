import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Interface defining the structure of image data returned from Pexels API
interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string; // URL to the image on Pexels website
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
}

// Custom hook for fetching and managing images from Pexels API
export function usePexelsImages() {
  // State for storing fetched images
  const [images, setImages] = useState<PexelsImage[]>([]);
  // State for tracking loading status during API calls
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch images based on search query
  const fetchImages = async (query: string) => {
    setIsLoading(true);
    try {
      // Make API request to Pexels
      // Parameters:
      // - query: search term
      // - per_page: number of results to return
      // - orientation: aspect ratio of images
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=200`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
          },
        }
      );

      // Check if the request was successful
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setImages(data.photos);
    } catch (error) {
      // Log error and show user-friendly toast notification
      console.error("Error fetching Pexels media:", error);
      toast({
        title: "Error fetching media",
        description:
          "Failed to fetch media. Have you added your own Pexels API key?",
        variant: "destructive",
      });
    } finally {
      // Reset loading state regardless of success/failure
      setIsLoading(false);
    }
  };

  // Return hook values and functions
  return { images, isLoading, fetchImages };
}
