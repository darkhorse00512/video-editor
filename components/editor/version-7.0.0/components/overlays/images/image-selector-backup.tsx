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

// Interface for generated image data from database
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

interface VaultSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (image: GeneratedImageData) => void;
  title?: string;
  description?: string;
  showAddonImages?: boolean; // Whether to show the Addon Images folder
}

export default function VaultSelector({
  open,
  onOpenChange,
  onImageSelect,
  title = "Select Image from Library",
  description = "Browse your library and select an image to use",
  showAddonImages = false, // Default to false - only show on composer page
}: VaultSelectorProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>(
    []
  );
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
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Image Selector with Folder Structure
            </h3>
            <p className="text-muted-foreground">
              Full VaultSelector implementation with folder navigation coming soon...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
