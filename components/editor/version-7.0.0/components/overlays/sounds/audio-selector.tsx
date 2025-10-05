import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Check,
  ChevronRight,
  Clock,
  FileAudio,
  Filter,
  Folder,
  Home,
  Loader2,
  Music,
  Pause,
  Play,
  Search,
  SortAsc,
  SortDesc,
  Star,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Interface for folder data from API
interface FolderData {
  Key: string;
}

// Interface for audio data from database
interface AudioData {
  audio_id: string;
  user_uuid: string;
  created_at: string;
  elevenlabs_id: string;
  prompt: string;
  filename: string;
  status: string;
  character_cost: number;
  audio_path: string; // folder path (without user/id prefix)
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

interface AudioSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAudioSelect: (audio: AudioData) => void;
  title?: string;
  description?: string;
}

export default function AudioSelector({
  open,
  onOpenChange,
  onAudioSelect,
  title = "Select Audio from Library",
  description = "Browse your audio library and select an audio file to use",
}: AudioSelectorProps) {
  const userState = useSelector((state: RootState) => state.user);
  const userData = userState.user;

  console.log("AudioSelector rendered - open:", open, "userData:", userData);
  const [audios, setAudios] = useState<AudioData[]>([]);
  const [totalAudiosCount, setTotalAudiosCount] = useState(0);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [audiosLoading, setAudiosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedAudio, setSelectedAudio] = useState<AudioData | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Filter state - simplified like VideoSelector
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{
    [key: string]: number;
  }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{
    [key: string]: boolean;
  }>({});

  // Build public URL for an audio row
  const getPublicUrl = (row: AudioData): string => {
    const pathPart = row.audio_path ? `${row.audio_path}/` : "";
    return `${config.data_url}/${userData?.id}/audio/${pathPart}${row.filename}`;
  };

  // Fetch audios from Supabase REST with folder filtering
  const fetchAudios = async () => {
    if (!userData?.id) return;
    
    setAudiosLoading(true);
    try {
      // Build query parameters for folder filtering
      const queryParams = new URLSearchParams();
      queryParams.append("user_uuid", "eq." + userData.id);
      queryParams.append("order", "created_at." + sortOrder);

      // Current path filter - show files from current folder
      if (currentPath === "") {
        // Root folder - show files with empty audio_path or null
        queryParams.append("or", "(audio_path.is.null,audio_path.eq.)");
      } else {
        // Specific folder - show files with matching audio_path
        queryParams.append("audio_path", "eq." + currentPath);
      }

      const url = `${config.supabase_server_url}/audio?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer WeInfl3nc3withAI",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to fetch audios:", response.status, text);
        toast.error("Failed to load audio library");
        return;
      }

      const rows: AudioData[] = await response.json();
      setAudios(Array.isArray(rows) ? rows : []);
      setTotalAudiosCount(rows.length);
    } catch (error) {
      console.error("Error fetching audios:", error);
      toast.error("Error loading audio library");
    } finally {
      setAudiosLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAudios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sortOrder, userData?.id, currentPath]);

  // Client-side filter, sort (by name optionally), and paginate
  const filteredAudios = useMemo(() => {
    let list = audios;
    
    // Status filter
    if (statusFilter !== "all") {
      list = list.filter(
        (a) => (a.status || "").toLowerCase() === statusFilter
      );
    }
    
    // Favorite filter
    if (favoriteFilter !== null) {
      list = list.filter((a) => a.favorite === favoriteFilter);
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.prompt?.toLowerCase().includes(q) ||
          a.filename?.toLowerCase().includes(q)
      );
    }
    
    // Sort
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.filename.localeCompare(b.filename));
      if (sortOrder === "desc") list.reverse();
    } else if (sortBy === "status") {
      list = [...list].sort((a, b) =>
        (a.status || "").localeCompare(b.status || "")
      );
      if (sortOrder === "desc") list.reverse();
    } else if (sortBy === "newest" || sortBy === "oldest") {
      list = [...list].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      if (sortBy === "newest") list.reverse();
    }
    
    return list;
  }, [audios, searchTerm, sortBy, sortOrder, statusFilter, favoriteFilter]);

  const totalPages = Math.ceil(totalAudiosCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAudios.slice(startIndex, endIndex);

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => handlePageChange(Math.min(totalPages, currentPage + 1));

  const handleGoToPage = () => {
    const page = parseInt(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setGoToPageInput("");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFavoriteFilter(null);
    setSortBy("newest");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Handle audio selection
  const handleAudioSelect = (audio: AudioData) => {
    console.log("Audio selected from selector:", audio);
    
    // Ensure the audio has the correct URL before passing it
    const audioUrl = getPublicUrl(audio);
    const audioWithUrl = {
      ...audio,
      audio_url: audioUrl,
    };
    
    console.log("Audio URL constructed:", audioUrl);
    console.log("Audio data being passed to overlay panel:", audioWithUrl);
    
    onAudioSelect(audioWithUrl);
    onOpenChange(false);
    
    // Enhanced success message with audio details
    const audioName = audio.filename || audio.prompt.substring(0, 30);
    toast.success(`Audio "${audioName}" added to timeline`, {
      description: `Status: ${audio.status} | Characters: ${audio.character_cost}`,
    });
  };

  // Play preview (single audio element)
  const handleAudioPlay = (audio: AudioData) => {
    const url = getPublicUrl(audio);
    if (playingAudioId === audio.audio_id) {
      audioElRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
    }
    audioElRef.current.src = url;
    audioElRef.current.onended = () => setPlayingAudioId(null);
    audioElRef.current
      .play()
      .then(() => setPlayingAudioId(audio.audio_id))
      .catch((e) => {
        console.error("Failed to play audio", e);
        toast.error("Failed to play audio");
      });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Placeholder: duration could be derived server-side if needed
  const formatDuration = () => {
    return "--:--";
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "audio/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/audio\//, "");
    return pathWithoutPrefix;
  };

  // Encode name for URL
  const encodeName = (name: string): string => {
    return encodeURIComponent(name);
  };

  // Decode name from URL
  const decodeName = (name: string): string => {
    return decodeURIComponent(name);
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (
    folderData: FolderData[]
  ): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    console.log("Building folder structure from:", folderData);

    folderData.forEach((folder) => {
      console.log("Processing folder:", folder);
      console.log("Folder key:", folder.Key);

      // Extract the folder path from the key
      const folderPath = extractFolderName(folder.Key);
      console.log("Extracted folder path:", folderPath);

      if (!folderPath) {
        console.log("No folder path extracted, skipping");
        return;
      }

      const pathParts = folderPath.split("/").filter((part) => part.length > 0);
      console.log("Path parts:", pathParts);

      let currentPath = "";

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        console.log(
          `Processing part "${part}", currentPath: "${currentPath}", parentPath: "${parentPath}"`
        );

        if (!pathMap.has(currentPath)) {
          const folderNode: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true,
          };

          pathMap.set(currentPath, folderNode);
          console.log(`Created folder node:`, folderNode);

          if (parentPath && pathMap.has(parentPath)) {
            console.log(`Adding to parent "${parentPath}"`);
            pathMap.get(parentPath)!.children.push(folderNode);
          } else if (!parentPath) {
            console.log(`Adding to root structure`);
            structure.push(folderNode);
          }
        }
      });
    });

    console.log("Final folder structure:", structure);
    return structure;
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
  };

  const navigateToHome = () => {
    setCurrentPath("");
  };

  const getBreadcrumbItems = (): Array<{ name: string; path: string }> => {
    if (!currentPath) return [];

    const pathParts = currentPath.split("/");
    const breadcrumbs: Array<{ name: string; path: string }> = [];
    let currentPathBuilt = "";

    pathParts.forEach((part, index) => {
      currentPathBuilt = currentPathBuilt
        ? `${currentPathBuilt}/${part}`
        : part;
      breadcrumbs.push({
        name: part,
        path: currentPathBuilt,
      });
    });

    return breadcrumbs;
  };

  // Get current path folders
  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) return folderStructure;

    const findFolder = (
      folders: FolderStructure[],
      path: string
    ): FolderStructure | null => {
      for (const folder of folders) {
        if (folder.path === path) return folder;
        const found = findFolder(folder.children, path);
        if (found) return found;
      }
      return null;
    };

    const currentFolder = findFolder(folderStructure, currentPath);
    return currentFolder ? currentFolder.children : [];
  };

  // Get current path raw folders
  const getCurrentPathRawFolders = (): FolderData[] => {
    if (!currentPath) return folders;

    return folders.filter((folder) => {
      const extractedPath = extractFolderName(folder.Key);
      return (
        extractedPath.startsWith(currentPath + "/") &&
        extractedPath.split("/").length === currentPath.split("/").length + 1
      );
    });
  };

  const fetchFolderFileCount = async (folderPath: string) => {
    if (!userData?.id) return;

    try {
      setLoadingFileCounts((prev) => ({ ...prev, [folderPath]: true }));

      const response = await fetch(
        `${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}&audio_path=eq.${folderPath}&select=count`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const count = data[0]?.count || 0;
        setFolderFileCounts((prev) => ({ ...prev, [folderPath]: count }));
      }
    } catch (error) {
      console.error(
        `Error fetching file count for folder ${folderPath}:`,
        error
      );
    } finally {
      setLoadingFileCounts((prev) => ({ ...prev, [folderPath]: false }));
    }
  };

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setFoldersLoading(true);

        const response = await fetch(`${config.backend_url}/getfoldernames`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            user: userData?.id,
            folder: "audio",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }

        const data = await response.json();
        console.log("Raw folders data from API:", data);
        setFolders(data);

        // Build folder structure
        const structure = buildFolderStructure(data);
        console.log("Built folder structure:", structure);
        setFolderStructure(structure);

        // If no structure was built, create a fallback from the raw data
        if (structure.length === 0 && data.length > 0) {
          console.log("No structure built, creating fallback folders");
          const fallbackFolders = data.map((folder: FolderData) => ({
            name:
              folder.Key || extractFolderName(folder.Key) || "Unknown Folder",
            path: folder.Key || extractFolderName(folder.Key) || "unknown",
            children: [],
            isFolder: true,
          }));
          console.log("Fallback folders:", fallbackFolders);
          setFolderStructure(fallbackFolders);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
        setFolders([]);
        setFolderStructure([]);
      } finally {
        setFoldersLoading(false);
      }
    };

    if (open && userData?.id) {
      fetchFolders();
    }
  }, [open, userData?.id]);

  // Fetch file counts for folders
  useEffect(() => {
    const fetchAllFolderFileCounts = async () => {
      const currentFolders = getCurrentPathFolders();

      // Fetch file counts for each immediate children folder of current path
      for (const folder of currentFolders) {
        await fetchFolderFileCount(folder.path);
      }
    };

    if (folderStructure.length > 0) {
      fetchAllFolderFileCounts();
    }
  }, [folderStructure, userData?.id, currentPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 p-2">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToHome}
              className="h-8 px-2 text-sm font-medium"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            {getBreadcrumbItems().map((item, index) => (
              <div key={item.path} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToFolder(item.path)}
                  className="h-8 px-2 text-sm font-medium"
                >
                  {decodeName(item.name)}
                </Button>
              </div>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search audios by prompt or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Favorite Filter */}
            <Select
              value={
                favoriteFilter === null
                  ? "all"
                  : favoriteFilter
                    ? "true"
                    : "false"
              }
              onValueChange={(value) =>
                setFavoriteFilter(value === "all" ? null : value === "true")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Favorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audios</SelectItem>
                <SelectItem value="true">Favorites</SelectItem>
                <SelectItem value="false">Not Favorites</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
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

            {/* Clear Filters */}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Folders Section */}
          {getCurrentPathFolders().length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Folders
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getCurrentPathFolders().map((folder) => (
                  <Card
                    key={folder.path}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 group"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-medium truncate">
                        {decodeName(folder.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loadingFileCounts[folder.path] ? (
                          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-8 rounded mx-auto mt-1"></div>
                        ) : (
                          `${folderFileCounts[folder.path] || 0} audios`
                        )}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Audios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Audios ({totalAudiosCount})
              </h3>
            </div>

            {/* Audios Grid */}
            {audiosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : audios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {audios.map((audio) => (
                  <Card
                    key={audio.audio_id}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 group hover:scale-[1.02] hover:-translate-y-1"
                    onClick={() => handleAudioSelect(audio)}
                  >
                    <CardContent className="p-4">
                      <div className="relative bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-700 dark:to-pink-600 rounded-lg overflow-hidden mb-3 aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <FileAudio className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        {audio.favorite && (
                          <div className="absolute top-2 right-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {audio.filename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {audio.prompt}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs ${getStatusBadgeColor(
                              audio.status
                            )}`}
                          >
                            {audio.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAudioPlay(audio);
                            }}
                            className="flex items-center gap-1"
                          >
                            {playingAudioId === audio.audio_id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            {playingAudioId === audio.audio_id
                              ? "Pause"
                              : "Play"}
                          </Button>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Volume2 className="w-3 h-3" />
                            {audio.character_cost} chars
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(audio.created_at)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No audios found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search or filters"
                    : "This folder is empty. Create some audios to get started!"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalAudiosCount > 0 && (
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
                  Showing {startIndex + 1}-{Math.min(endIndex, totalAudiosCount)} of{" "}
                  {totalAudiosCount} audios
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
        {/* Hidden audio element for preview playback */}
        <audio ref={audioElRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
