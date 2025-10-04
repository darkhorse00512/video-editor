import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import config from "@/config/config";
import { RootState } from "@/store/store";
import {
  Calendar,
  ChevronRight,
  Filter,
  Folder,
  Home,
  Image,
  Search,
  SortAsc,
  SortDesc,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Interface for folder data from API
interface FolderData {
  Key: string;
}

// Interface for file data from getfilenames API
interface FileData {
  Key: string;
  Size: string;
  LastModified: string;
  ETag: string;
  StorageClass: string;
}

// Interface for generated image data from database (matching working VaultSelector)
interface GeneratedImageData {
  id: string;
  task_id: string;
  image_sequence_number: number;
  system_filename: string;
  user_filename: string | null;
  user_notes: string | null;
  user_tags: string[] | null;
  file_path: string;
  file_size_bytes: number;
  image_format: string;
  seed: number;
  guidance: number;
  steps: number;
  nsfw_strength: number;
  lora_strength: number;
  model_version: string;
  t5xxl_prompt: string;
  clip_l_prompt: string;
  negative_prompt: string;
  generation_status: string;
  generation_started_at: string;
  generation_completed_at: string;
  generation_time_seconds: number;
  error_message: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  actual_seed_used: number;
  prompt_file_used: string;
  quality_setting: string;
  rating: number;
  favorite: boolean;
  file_type: string;
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

interface ImageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (image: GeneratedImageData) => void;
  title?: string;
  description?: string;
  showAddonImages?: boolean;
}

export default function ImageSelector({
  open,
  onOpenChange,
  onImageSelect,
  title = "Select Image from Library",
  description = "Browse your library and select an image to use",
  showAddonImages = false,
}: ImageSelectorProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<{
    fileTypes: string[];
    favorites: boolean | null;
    ratingRange: { min: number; max: number };
    withNotes: boolean | null;
    withTags: boolean | null;
    selectedTags: string[];
  }>({
    fileTypes: [],
    favorites: null,
    ratingRange: { min: 0, max: 5 },
    withNotes: null,
    withTags: null,
    selectedTags: [],
  });

  // Filter menu state
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  // Addon Images state
  const [isInAddonImages, setIsInAddonImages] = useState(false);
  const [addonImages, setAddonImages] = useState<any[]>([]);
  const [addonImagesLoading, setAddonImagesLoading] = useState(false);
  const [addonFolders, setAddonFolders] = useState<FolderData[]>([]);
  const [addonFoldersLoading, setAddonFoldersLoading] = useState(false);
  const [addonCurrentPath, setAddonCurrentPath] = useState<string>("");

  // Folder file counts
  const [folderFileCounts, setFolderFileCounts] = useState<{
    [key: string]: number;
  }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{
    [key: string]: boolean;
  }>({});

  // Professional data fetching with proper user_uuid filtering, search, and pagination (matching VaultSelector)
  const fetchVaultDataWithFilters = useCallback(async () => {
    if (!userData.user?.id) return;

    try {
      setIsLoading(true);
      setFilesLoading(true);

      // Build query parameters for database
      const queryParams = new URLSearchParams();

      // Base user filter
      queryParams.append("user_uuid", "eq." + userData.user.id);

      // Generation status filter - only show completed images
      queryParams.append("generation_status", "eq.completed");

      // Current path filter - show files from current folder
      if (currentPath === "") {
        // Root folder - show files with empty user_filename or null
        queryParams.append("or", "(user_filename.is.null,user_filename.eq.)");
      } else {
        // Specific folder - show files with matching user_filename
        queryParams.append("user_filename", "eq." + currentPath);
      }

      // Search filter - combine with existing or condition
      if (searchTerm.trim()) {
        // If we already have an or condition, we need to combine them
        const existingOr = queryParams.get("or");
        if (existingOr) {
          // Combine the existing or condition with the search condition
          queryParams.set("or", `(${existingOr},system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
        } else {
          queryParams.append("or", `(system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
        }
      }

      // File type filter
      if (selectedFilters.fileTypes.length > 0) {
        queryParams.append(
          "file_type",
          "in.(" + selectedFilters.fileTypes.join(",") + ")"
        );
      }

      // Favorite filter
      if (selectedFilters.favorites !== null) {
        queryParams.append("favorite", "eq." + selectedFilters.favorites);
      }

      // Rating range filter
      if (selectedFilters.ratingRange.min > 0) {
        queryParams.append("rating", "gte." + selectedFilters.ratingRange.min);
      }
      if (selectedFilters.ratingRange.max < 5) {
        queryParams.append("rating", "lte." + selectedFilters.ratingRange.max);
      }

      // Notes filter
      if (selectedFilters.withNotes === true) {
        queryParams.append("user_notes", "not.is.null");
        queryParams.append("user_notes", "neq.");
      } else if (selectedFilters.withNotes === false) {
        // Combine with existing or condition
        const existingOr = queryParams.get("or");
        if (existingOr) {
          queryParams.set("or", `(${existingOr},user_notes.is.null,user_notes.eq.)`);
        } else {
          queryParams.append("or", "(user_notes.is.null,user_notes.eq.)");
        }
      }

      // Tags filter
      if (selectedFilters.selectedTags.length > 0) {
        queryParams.append(
          "user_tags",
          "cs.{" + selectedFilters.selectedTags.join(",") + "}"
        );
      }

      // Sorting
      let orderBy = "created_at";
      if (sortBy === "newest" || sortBy === "oldest") {
        orderBy = "created_at";
      } else if (sortBy === "rating") {
        orderBy = "rating";
      } else if (sortBy === "filename") {
        orderBy = "system_filename";
      }

      queryParams.append(
        "order",
        orderBy + "." + (sortOrder === "desc" ? "desc" : "asc")
      );

      // Pagination
      const offset = (currentPage - 1) * itemsPerPage;
      queryParams.append("limit", itemsPerPage.toString());
      queryParams.append("offset", offset.toString());

      console.log("Fetching images with query:", `${config.supabase_server_url}/generated_images?${queryParams.toString()}`);

      // Fetch data from database with all filters
      const response = await fetch(
        `${config.supabase_server_url}/generated_images?${queryParams.toString()}`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response);

      if (!response.ok) {
        console.error("Failed to fetch images:", response.status, response.statusText);
        throw new Error("Failed to fetch library data");
      }

      const data: GeneratedImageData[] = await response.json();

      console.log("Data:", data);

      // Get total count for pagination
      const countParams = new URLSearchParams();
      countParams.append("user_uuid", "eq." + userData.user.id);

      // Generation status filter for count query - only show completed images
      countParams.append("generation_status", "eq.completed");

      // Current path filter for count query
      if (currentPath === "") {
        // Root folder - show files with empty user_filename or null
        countParams.append("or", "(user_filename.is.null,user_filename.eq.)");
      } else {
        // Specific folder - show files with matching user_filename
        countParams.append("user_filename", "eq." + currentPath);
      }

      if (searchTerm.trim()) {
        // Combine with existing or condition
        const existingOr = countParams.get("or");
        if (existingOr) {
          countParams.set("or", `(${existingOr},system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
        } else {
          countParams.append("or", `(system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
        }
      }

      if (selectedFilters.fileTypes.length > 0) {
        countParams.append(
          "file_type",
          "in.(" + selectedFilters.fileTypes.join(",") + ")"
        );
      }

      if (selectedFilters.favorites !== null) {
        countParams.append("favorite", "eq." + selectedFilters.favorites);
      }

      if (selectedFilters.ratingRange.min > 0) {
        countParams.append("rating", "gte." + selectedFilters.ratingRange.min);
      }
      if (selectedFilters.ratingRange.max < 5) {
        countParams.append("rating", "lte." + selectedFilters.ratingRange.max);
      }

      if (selectedFilters.withNotes === true) {
        countParams.append("user_notes", "not.is.null");
        countParams.append("user_notes", "neq.");
      } else if (selectedFilters.withNotes === false) {
        // Combine with existing or condition
        const existingOr = countParams.get("or");
        if (existingOr) {
          countParams.set("or", `(${existingOr},user_notes.is.null,user_notes.eq.)`);
        } else {
          countParams.append("or", "(user_notes.is.null,user_notes.eq.)");
        }
      }

      if (selectedFilters.selectedTags.length > 0) {
        countParams.append(
          "user_tags",
          "cs.{" + selectedFilters.selectedTags.join(",") + "}"
        );
      }

      const countResponse = await fetch(
        `${config.supabase_server_url}/generated_images?${countParams.toString()}&select=count`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
        }
      );

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setTotalItems(countData[0]?.count || 0);
      }

      setGeneratedImages(data);
      console.log("Fetched library data:", data);
    } catch (error) {
      console.error("Error fetching library data:", error);
      toast.error("Failed to fetch library data", {
        description: "Please try again later.",
        duration: 5000,
      });
      setGeneratedImages([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
      setFilesLoading(false);
    }
  }, [
    userData.user?.id,
    currentPath,
    searchTerm,
    selectedFilters,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);

  // Fetch data when filters or pagination changes
  useEffect(() => {
    if (open) {
      fetchVaultDataWithFilters();
    }
  }, [fetchVaultDataWithFilters, open]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters, sortBy, sortOrder]);

  const handleImageSelect = (image: GeneratedImageData) => {
    onImageSelect(image);
    onOpenChange(false);
    toast.success(`Selected: ${image.system_filename}`);
  };

  const getImageUrl = (image: GeneratedImageData) => {
    return `${config.data_url}/${userData.user?.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
  };

  // Pagination functions
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = generatedImages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    handlePageChange(Math.min(totalPages, currentPage + 1));

  const handleGoToPage = () => {
    const page = parseInt(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setGoToPageInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Image className="w-5 h-5 text-white" />
            </div>
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          {/* Professional Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search library by title, notes, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="filename">Filename</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
              >
                {sortOrder === "desc" ? (
                  <SortDesc className="w-4 h-4" />
                ) : (
                  <SortAsc className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Images</h3>
              <Badge variant="secondary">{currentItems.length} images</Badge>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-muted-foreground">Loading images...</p>
                </div>
              </div>
            )}

            {/* Images Grid */}
            {!isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentItems.map((image) => (
                  <Card
                    key={image.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                    onClick={() => handleImageSelect(image)}
                  >
                    <CardContent className="p-2">
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden mb-2">
                        <img
                          src={getImageUrl(image)}
                          alt={image.system_filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {image.favorite && (
                          <div className="absolute top-2 right-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                        )}
                        {image.rating > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                            ⭐ {image.rating}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate">
                          {image.system_filename}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(image.created_at).toLocaleDateString()}
                        </div>
                        {image.user_tags && image.user_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.user_tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {image.user_tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{image.user_tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && currentItems.length === 0 && (
              <div className="text-center py-12">
                <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No images found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "This folder is empty. Upload some images to get started!"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700 mt-4">
              {/* Left side: Items per page selector and page info */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Items per page:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newItemsPerPage = parseInt(value);
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                  {totalItems} items
                </div>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                {/* Go to page input */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Go to:
                  </span>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPageInput}
                    onChange={(e) => setGoToPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleGoToPage();
                      }
                    }}
                    className="w-16 h-8 text-center text-sm"
                    placeholder="Page"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToPage}
                    className="h-8 px-2 text-sm"
                  >
                    Go
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
