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
  Clock,
  FileAudio,
  Filter,
  Loader2,
  Music,
  Pause,
  Play,
  Search,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  const userData = useSelector((state: RootState) => state.user);
  const [audios, setAudios] = useState<AudioData[]>([]);
  const [audiosLoading, setAudiosLoading] = useState(false);
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

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Build public URL for an audio row
  const getPublicUrl = (row: AudioData): string => {
    const pathPart = row.audio_path ? `${row.audio_path}/` : "";
    return `${config.data_url}/${userData.user?.id}/audio/${pathPart}${row.filename}`;
  };

  // Fetch audios from Supabase REST
  const fetchAudios = async () => {
    if (!userData.user?.id) return;
    
    setAudiosLoading(true);
    try {
      const url = `${config.supabase_server_url}/audio?user_uuid=eq.${userData.user.id}&order=created_at.${sortOrder}`;
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
  }, [open, sortOrder, userData.user?.id]);

  // Client-side filter, sort (by name optionally), and paginate
  const filteredAudios = useMemo(() => {
    let list = audios;
    if (statusFilter !== "all") {
      list = list.filter(
        (a) => (a.status || "").toLowerCase() === statusFilter
      );
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.prompt?.toLowerCase().includes(q) ||
          a.filename?.toLowerCase().includes(q)
      );
    }
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
  }, [audios, searchTerm, sortBy, sortOrder, statusFilter]);

  const totalAudiosCount = filteredAudios.length;
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

  // Selection
  const handleAudioSelect = (audio: AudioData) => {
    setSelectedAudio(audio);
    // Return adjusted audio_path so caller can prefix with config.data_url directly
    const adjusted = {
      ...audio,
      audio_path: `${userData.user?.id}/audio/${
        audio.audio_path ? audio.audio_path + "/" : ""
      }${audio.filename}`,
    } as AudioData;
    onAudioSelect(adjusted);
    onOpenChange(false);
    toast.success(
      `Selected audio: ${(audio.prompt || audio.filename).substring(0, 50)}...`
    );
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
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search audios by prompt or filename..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(v: "asc" | "desc") => setSortOrder(v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Audio Grid */}
          <div className="flex-1 overflow-auto">
            {audiosLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                  <p className="text-gray-500">Loading audio library...</p>
                </div>
              </div>
            ) : totalAudiosCount === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <Music className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      No audios found
                    </p>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Your audio library is empty"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((audio) => (
                  <Card
                    key={audio.audio_id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                      selectedAudio?.audio_id === audio.audio_id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                    onClick={() => handleAudioSelect(audio)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Audio Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <FileAudio className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {audio.filename}
                              </p>
                              <Badge
                                className={`text-xs ${getStatusBadgeColor(
                                  audio.status
                                )}`}
                              >
                                {audio.status}
                              </Badge>
                            </div>
                          </div>

                          {selectedAudio?.audio_id === audio.audio_id && (
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Audio Preview */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {audio.prompt}
                          </p>

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
                              <Clock className="w-3 h-3" />
                              {formatDuration()}
                            </div>
                          </div>
                        </div>

                        {/* Audio Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(audio.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {audio.character_cost} chars
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
