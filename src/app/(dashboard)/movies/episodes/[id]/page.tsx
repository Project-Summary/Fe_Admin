// File: app/(dashboard)/movies/episodes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Play,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Calendar,
  Hash,
  Tv2,
  Users,
  Download,
  Settings,
  FileText,
  Video,
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { deleteEpisodeThunk, getEpisodeDetailThunk, getFilmByIdThunk } from '@/app/redux/film/thunk.film';
import { IEpisode, ContentStatus, IMappingMovie, IEpisodeWithMovie } from '@/app/redux/film/interface.film';
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

export default function EpisodeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const episodeId = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Redux state
  const { loading, error } = useSelector((state: RootState) => state.film);

  // Local state
  const [episode, setEpisode] = useState<IEpisode | null>(null);
  const [movie, setMovie] = useState<IMappingMovie>();

  // Fetch episode details on mount
  useEffect(() => {
    if (episodeId) {
      fetchEpisodeDetails();
    }
  }, [episodeId]);

  const fetchEpisodeDetails = async () => {
    try {
      const episodeResult = await dispatch(getEpisodeDetailThunk({ epId: episodeId })).unwrap();
      setEpisode(episodeResult.data.data);

      // Fetch movie details if we have movieId
      if (episodeResult?.data.data.movieId) {
        const movieResult = await dispatch(getFilmByIdThunk(episodeResult.data.data.movieId)).unwrap();
        setMovie(movieResult.data.data);
      }
    } catch (error) {
      console.error('Error fetching episode details:', error);
      toast.error('Không thể tải thông tin chi tiết về tập phim');
    }
  };

  // Handle edit episode
  const handleDeleteEpisode = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete episode
  const confirmDeleteEpisode = async () => {
    if (!episodeId) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteEpisodeThunk({
        id: movie?._id as string,
        epId: episodeId,
        onSuccess: () => {
          router.push("/episodes");
          toast.success('Tập phim đã được xóa thành công');
        }
      })).unwrap();

    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Không xóa được tập:' + ((error as any)?.message || 'Lỗi không xác định'));
    } finally {
      setIsDeleting(false);
    }
  };



  // Handle preview episode
  const handlePreviewEpisode = () => {
    if (episode) {
      router.push(`/movies/episodes/${episode._id}/preview`);
    }
  };

  // Handle go to movie
  const handleGoToMovie = () => {
    if (episode) {
      router.push(`/movies/${episode.movieId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải thông tin chi tiết về tập phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-lg font-medium">Không tìm thấy tập phim</h3>
          <p className="text-muted-foreground">
            {error || 'The episode you are looking for does not exist.'}
          </p>
          <Button onClick={() => router.push('/movies/episodes')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Tập phim
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay trở lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{episode.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={
                episode.status === ContentStatus.PUBLISHED ? "default" :
                  episode.status === ContentStatus.PENDING_REVIEW ? "outline" : "secondary"
              }>
                {episode.status === ContentStatus.PUBLISHED ? "Published" :
                  episode.status === ContentStatus.PENDING_REVIEW ? "Pending review" : "Draft"}
              </Badge>
              {episode.isAIGenerated && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Users className="mr-1 h-3 w-3" />
                  AI tạo ra
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewEpisode}>
            <Play className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button
            onClick={handleDeleteEpisode}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xóa Tập
          </Button>
        </div>
      </div>

      {/* Episode Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Episode Thumbnail/Video */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-t-lg relative overflow-hidden">
                {episode.thumbnail ? (
                  <img
                    src={episode.thumbnail}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button size="lg" className="rounded-full" onClick={handlePreviewEpisode}>
                    <Play className="mr-2 h-5 w-5" />
                    Xem Tập phim
                  </Button>
                </div>
                {/* Duration overlay */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                  {episode.duration}phút
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{episode.statistics.views.toLocaleString()} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{episode.statistics.likes.toLocaleString()} thích</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{episode.statistics.comments.toLocaleString()} bình luận</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Episode Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="transcript">Bản ghi chép</TabsTrigger>
              <TabsTrigger value="subtitles">Phụ đề</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tập phim</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {episode.description && (
                    <div>
                      <h4 className="font-medium mb-2">Miêu tả</h4>
                      <p className="text-muted-foreground">{episode.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Số tập</h4>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span>{episode.episodeNumber}</span>
                      </div>
                    </div>

                    {episode.seasonNumber && (
                      <div>
                        <h4 className="font-medium mb-2">Mùa</h4>
                        <span>Mùa {episode.seasonNumber}</span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Khoảng thời gian</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{episode.duration} phút</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tạo</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(episode.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {episode.videoUrl && (
                    <div>
                      <h4 className="font-medium mb-2">Đường dẫn Video </h4>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <code className="text-sm flex-1 truncate">{episode.videoUrl}</code>
                        <Button variant="ghost" size="sm" onClick={() => window.open(episode.videoUrl, '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bản ghi chép tập phim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {episode.transcript ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
                        {movie?.script}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Không có bản ghi chép nào cho tập này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subtitles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phụ đề có sẵn</CardTitle>
                </CardHeader>
                <CardContent>
                  {episode.subtitles && episode.subtitles.length > 0 ? (
                    <div className="space-y-2">
                      {episode.subtitles.map((subtitle, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{subtitle.language}</Badge>
                            <span className="text-sm">{subtitle.language} Phụ đề</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(subtitle.url, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Tải về
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>Không có phụ đề cho tập phim này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Movie Information */}
          {movie && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tv2 className="h-5 w-5" />
                  Chi tiết phim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {movie.description}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng số tập:</span>
                    <span>{movie.totalEpisodes || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngày phát hành:</span>
                    <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Xếp hạng:</span>
                    <span>{movie.averageRating ? `${movie.averageRating}/10` : 'Not rated'}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoToMovie}>
                  <Tv2 className="mr-2 h-4 w-4" />
                  Xem Chi Tiết Phim
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Episode Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê tập phim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {episode.statistics.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Lượt xem</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {episode.statistics.likes.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Thích</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {episode.statistics.comments.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Bình luận</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {episode.statistics.shares.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Chia sẻ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleDeleteEpisode}>
                <Edit className="mr-2 h-4 w-4" />
                Xóa tập phim
              </Button>
              <Button variant="outline" className="w-full" onClick={handlePreviewEpisode}>
                <Play className="mr-2 h-4 w-4" />
                Xem trước tập phim
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/movies/episodes')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tất cả các tập phim
              </Button>
              <Separator />
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Chi tiết in
              </Button>
            </CardContent>
          </Card>

          {/* Episode Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Siêu dữ liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID tập phim:</span>
                <code className="text-xs bg-muted px-1 rounded">{episode._id}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID phim:</span>
                <code className="text-xs bg-muted px-1 rounded">{episode.movieId}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Được tạo bởi:</span>
                <span className="text-xs">{episode.createdBy || 'System'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="text-xs">{new Date(episode.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI tạo ra:</span>
                <Badge variant={episode.isAIGenerated ? "default" : "secondary"} className="text-xs">
                  {episode.isAIGenerated ? "Có" : "Không"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tập phim</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa không? "{episode?.title}"? Không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
    </div>
  );
}
