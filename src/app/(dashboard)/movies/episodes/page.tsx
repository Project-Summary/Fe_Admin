// File: app/(dashboard)/movies/episodes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import {
  Film,
  Search,
  MoreHorizontal,
  Plus,
  Clock,
  Eye,
  Calendar,
  Tv2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash,
  CheckCircle2,
  Play,
  Filter,
  Hash,
  Users,
  Heart,
  MessageSquare,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
  getAllFilmsThunk,
  getEpisodesWithFilmThunk,
  deleteEpisodeThunk,
} from '@/app/redux/film/thunk.film';
import { IEpisodeWithMovie, ContentStatus } from '@/app/redux/film/interface.film';

// Status options for filtering
const statusOptions = [
  { value: 'all', label: 'Tất cả tập phim' },
  { value: 'published', label: 'Đã phát hành' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'scheduled', label: 'Đã lên lịch' },
];

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'episode-asc', label: 'Số tập (Tăng dần)' },
  { value: 'episode-desc', label: 'Số tập (Giảm dần)' },
  { value: 'title-asc', label: 'Tiêu đề (A-Z)' },
  { value: 'title-desc', label: 'Tiêu đề (Z-A)' },
  { value: 'views-high', label: 'Lượt xem nhiều nhất' },
  { value: 'views-low', label: 'Lượt xem ít nhất' },
  { value: 'duration-high', label: 'Thời lượng dài nhất' },
  { value: 'duration-low', label: 'Thời lượng ngắn nhất' },
];


export default function EpisodesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { films, loading, error } = useSelector((state: RootState) => state.film);

  // Local state
  const [allEpisodes, setAllEpisodes] = useState<IEpisodeWithMovie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<IEpisodeWithMovie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch all films and their episodes on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      await dispatch(getAllFilmsThunk());
    } catch (error) {
      console.error('Error fetching films:', error);
      toast.error('Không tải được phim');
    }
  }, [dispatch]);

  // Fetch episodes for all films when films data is available
  useEffect(() => {
    const fetchAllEpisodes = async () => {
      if (films && Array.isArray(films) && films.length > 0) {
        try {
          const episodePromises = films.map(film =>
            dispatch(getEpisodesWithFilmThunk(film._id))
          );

          const episodeResults = await Promise.allSettled(episodePromises);

          // Combine all episodes from all films
          const combinedEpisodes: IEpisodeWithMovie[] = [];

          episodeResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              const response = result.value as any;
              const filmEpisodes = response.payload?.data?.data || [];

              // Add film information to each episode
              const episodesWithFilmInfo: IEpisodeWithMovie[] = filmEpisodes.map((episode: any) => ({
                _id: episode._id,
                movieId: episode.movieId || films[index]._id,
                title: episode.title || 'Tập phim chưa có tiêu đề',
                description: episode.description,
                thumbnail: episode.thumbnail,
                videoUrl: episode.videoUrl,
                duration: episode.duration || 0,
                episodeNumber: episode.episodeNumber || 0,
                seasonNumber: episode.seasonNumber,
                status: episode.status || ContentStatus.DRAFT,
                isAIGenerated: episode.isAIGenerated || false,
                statistics: episode.statistics || {
                  views: 0,
                  likes: 0,
                  comments: 0,
                  shares: 0
                },
                transcript: episode.transcript,
                subtitles: episode.subtitles || [],
                createdBy: episode.createdBy,
                createdAt: episode.createdAt,
                updatedAt: episode.updatedAt,
                movieTitle: films[index]?.title || 'Phim không rõ',
                moviePoster: films[index]?.poster || '',
              }));

              combinedEpisodes.push(...episodesWithFilmInfo);
            }
          });

          setAllEpisodes(combinedEpisodes);
        } catch (error) {
          console.error('Error fetching episodes:', error);
          toast.error('Không tải được tập phim');
        }
      }
    };

    fetchAllEpisodes();
  }, [films, dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAllData();
    toast.success('Dữ liệu được làm mới');
  };

  // Apply filters and sorting
  const filteredEpisodes = allEpisodes
    .filter(episode => {
      // Apply search filter
      const matchesSearch =
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.episodeNumber.toString().includes(searchTerm);

      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && episode.status === statusFilter;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'episode-asc':
          return a.episodeNumber - b.episodeNumber;
        case 'episode-desc':
          return b.episodeNumber - a.episodeNumber;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'views-high':
          return b.statistics.views - a.statistics.views;
        case 'views-low':
          return a.statistics.views - b.statistics.views;
        case 'duration-high':
          return b.duration - a.duration;
        case 'duration-low':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  // Handle delete episode
  const handleDeleteEpisode = (episode: IEpisodeWithMovie) => {
    setEpisodeToDelete(episode);
    setDeleteDialogOpen(true);
  };

  // Confirm delete episode
  const confirmDeleteEpisode = async () => {
    if (!episodeToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteEpisodeThunk({
        id: episodeToDelete.movieId,
        epId: episodeToDelete._id,
        onSuccess: () => {
          setAllEpisodes(allEpisodes.filter(ep => ep._id !== episodeToDelete._id));
          setDeleteDialogOpen(false);
          setEpisodeToDelete(null);
          toast.success('Tập phim đã xóa thành công');
        }
      })).unwrap();

    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Không xóa được tập: ' + ((error as any)?.message || 'Lỗi không xác định'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle view episode details
  const handleViewEpisode = (episode: IEpisodeWithMovie) => {
    router.push(`/movies/episodes/${episode._id}`);
  };

  // Handle edit episode
  const handleEditEpisode = (episode: IEpisodeWithMovie) => {
    router.push(`/movies/${episode.movieId}/episodes/${episode._id}/edit`);
  };

  // Calculate statistics
  const stats = {
    total: allEpisodes.length,
    published: allEpisodes.filter(ep => ep.status === ContentStatus.PUBLISHED).length,
    drafts: allEpisodes.filter(ep => ep.status === ContentStatus.DRAFT).length,
    scheduled: allEpisodes.filter(ep => ep.status === ContentStatus.PENDING_REVIEW).length,
    totalViews: allEpisodes.reduce((acc, ep) => acc + ep.statistics.views, 0),
    totalDuration: allEpisodes.reduce((acc, ep) => acc + ep.duration, 0),
    aiGenerated: allEpisodes.filter(ep => ep.isAIGenerated).length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Quản lý tập phim</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button className="gap-2" onClick={() => router.push("/movies/new")}>
            <Plus className="h-4 w-4" />
            Thêm Phim
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Lỗi: {error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tập phim</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.totalDuration / 60)} tổng số giờ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.published / stats.total) * 100) || 0}% của tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Edit className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.scheduled} đã lên lịch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình: {Math.round(stats.totalViews / stats.total) || 0} mỗi tập phim
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI tạo ra</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.aiGenerated / stats.total) * 100) || 0}% trên tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thời lượng trung bình</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(stats.totalDuration / stats.total) || 0}phút
            </div>
            <p className="text-xs text-muted-foreground">
              Mỗi tập phim
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tập phim, phim hoặc số tập phim..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {(searchTerm || statusFilter !== 'all') && (
              <Badge variant="secondary" className="ml-1">
                {[
                  searchTerm && 'search',
                  statusFilter !== 'all' && 'status'
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <span className="text-sm">Hiển thị:</span>
              <span className="text-sm font-medium">{filteredEpisodes.length} của {allEpisodes.length}</span>
            </div>

            <div />

            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('newest');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Episodes table */}
      <Card>
        <CardContent className="p-0">
          {loading && allEpisodes.length === 0 ? (
            <div className="flex h-80 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải tập phim...</p>
              </div>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
              <Film className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {allEpisodes.length === 0 ? 'Chưa có tập nào' : 'Không tìm thấy tập nào'}
              </h3>
              <p className="text-muted-foreground">
                {allEpisodes.length === 0
                  ? 'Tạo phim có tập để xem ở đây'
                  : 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn'
                }
              </p>
              {allEpisodes.length === 0 && (
                <Button className="mt-4" onClick={() => router.push("/movies/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bộ phim đầu tiên của bạn
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
                <div className="col-span-3">Tập phim</div>
                <div className="col-span-2">Phim</div>
                <div className="col-span-1">Tập số</div>
                <div className="col-span-1">Thời lượng</div>
                {/* <div className="col-span-1">Trạng thái</div> */}
                <div className="col-span-2">Thống kê</div>
                <div className="col-span-1">Ngày tạo</div>
                <div className="col-span-1 text-right">Thao tác</div>
              </div>
              <div className="divide-y">
                {filteredEpisodes.map((episode) => (
                  <div key={episode._id} className="grid grid-cols-12 p-4 items-center hover:bg-muted/30 transition-colors">
                    <div className="col-span-3 font-medium flex items-center gap-2">
                      <div className="relative">
                        {episode.thumbnail ? (
                          <img
                            src={episode.thumbnail}
                            alt={episode.title}
                            className="w-12 h-8 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-muted rounded border flex items-center justify-center">
                            <Film className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        {episode.isAIGenerated && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                            <Users className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{episode.title}</div>
                        {episode.description && (
                          <div className="truncate text-xs text-muted-foreground">
                            {episode.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                      <Tv2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate text-sm">{episode.movieTitle}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{episode.episodeNumber}</span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{episode.duration}m</span>
                    </div>
                    {/* <div className="col-span-1">
                      <Badge variant={
                        episode.status === ContentStatus.PUBLISHED ? "default" :
                          episode.status === ContentStatus.PENDING_REVIEW ? "outline" : "secondary"
                      }>
                        {episode.status === ContentStatus.PUBLISHED ? "Published" :
                          episode.status === ContentStatus.PENDING_REVIEW ? "Pending Review" : "Draft"}
                      </Badge>
                    </div> */}
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span>{episode.statistics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-muted-foreground" />
                          <span>{episode.statistics.likes.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span>{episode.statistics.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-3 w-3 text-muted-foreground" />
                          <span>{episode.statistics.shares.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">
                        {new Date(episode.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewEpisode(episode)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/movies/episodes/${episode._id}/preview`)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Xem trước tập phim
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteEpisode(episode)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Xóa Tập
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tập phim</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{episodeToDelete?.title}" không? Hành động này sẽ không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEpisode}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa tập phim'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}

