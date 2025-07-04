'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  Bot,
  Film,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
  getAllFilmsThunk,
  deleteFilmThunk,
  updateFilmThunk,
} from '@/app/redux/film/thunk.film';
import { getCategoriesThunk } from '@/app/redux/categories/thunk.categories';
import { StoriesCategories } from '@/app/redux/story/interface.story';
import { ContentStatus } from '@/app/redux/film/interface.film';

// Tùy chọn trạng thái
const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

// Tùy chọn sắp xếp
const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'views-high', label: 'Lượt xem nhiều nhất' },
  { value: 'views-low', label: 'Lượt xem ít nhất' },
  { value: 'likes-high', label: 'Lượt thích nhiều nhất' },
  { value: 'likes-low', label: 'Lượt thích ít nhất' },
  { value: 'title-asc', label: 'Tiêu đề (A-Z)' },
  { value: 'title-desc', label: 'Tiêu đề (Z-A)' },
];

export default function MoviesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { films, loading, error } = useSelector((state: RootState) => state.film);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(
    (state: RootState) => state.categories
  );
  // Local state
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Select all checkbox state
  const allSelected = movies.length > 0 && selectedMovies.length === movies.length;
  const someSelected = selectedMovies.length > 0 && selectedMovies.length < movies.length;

  // Fetch movies on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategoriesThunk());
  }, [dispatch]);

  // Filter available categories (only active story categories)
  const availableCategories = categories.filter(
    category => category.isActive &&
      (category.type === 'movie' || category.type === 'both')
  );

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(getAllFilmsThunk()),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [dispatch]);

  // Refresh data
  const handleRefresh = () => {
    fetchAllData();
    toast.success('Đã làm mới dữ liệu');
  };

  // Map Redux films data to local format
  const mappingDataFilms = useCallback(() => {
    if (films && Array.isArray(films)) {
      const formatDataFilm = films.map((film: any) => ({
        id: film._id || film.id,
        title: film.title || 'Không có tiêu đề',
        poster: film.poster,
        episodes: film.episodes.length || 0,
        views: film.statistics?.views || 0,
        likes: film.statistics?.likes || 0,
        rating: film.statistics?.rating || 0,
        genre: film.categories.map((category: StoriesCategories) => category.name),
        status: film.status || 'draft',
        aiGenerated: film.isAIGenerated || false,
        isFeatured: film.isFeatured || false,
        isNew: film.isNew || false,
        releaseDate: film.releaseDate,
        duration: film.duration || 0,
        createdAt: film.createdAt,
        updatedAt: film.updatedAt,
      }));

      setMovies(formatDataFilm);
    }
  }, [films]);

  // Update movies when films data changes
  useEffect(() => {
    mappingDataFilms();
  }, [mappingDataFilms]);

  // Apply filters and sorting
  const filteredMovies = movies
    .filter((movie: any) => {
      // Apply search filter
      if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply status filter
      if (statusFilter !== 'all' && movie.status !== statusFilter) {
        return false;
      }

      // Apply genre filter
      if (genreFilter !== 'all' && !movie.genre.some((g: any) => g.toLowerCase() === genreFilter)) {
        return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views-high':
          return b.views - a.views;
        case 'views-low':
          return a.views - b.views;
        case 'likes-high':
          return b.likes - a.likes;
        case 'likes-low':
          return a.likes - b.likes;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (allSelected || someSelected) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map((movie: any) => movie.id));
    }
  };

  // Handle individual checkbox
  const handleSelectMovie = (id: string) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter((movieId: string) => movieId !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  // Handle delete movie
  const handleDeleteMovie = (id: string) => {
    setMovieToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete movie
  const confirmDeleteMovie = async () => {
    if (!movieToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteFilmThunk({
        id: movieToDelete,
        onSuccess: () => {
          setSelectedMovies(selectedMovies.filter((id: string) => id !== movieToDelete));
          setDeleteDialogOpen(false);
          setMovieToDelete(null);
          // Refresh the films list
          dispatch(getAllFilmsThunk());
        }
      })).unwrap();

    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Không xóa được phim: ' + ((error as any)?.message || 'Lỗi không xác định'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedMovies.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete movies one by one
      const deletePromises = selectedMovies.map(id =>
        dispatch(deleteFilmThunk({
          id,
          onSuccess: () => { } // Empty callback for bulk operations
        })).unwrap()
      );

      await Promise.all(deletePromises);

      setSelectedMovies([]);
      setBulkDeleteDialogOpen(false);

      // Refresh the films list
      dispatch(getAllFilmsThunk());

      toast.success(`${selectedMovies.length} movies deleted successfully`);
    } catch (error) {
      console.error('Error bulk deleting movies:', error);
      toast.error('Không xóa được một số phim');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    setUpdatingStatus(id);
    try {
      await dispatch(updateFilmThunk({
        id,
        data: { status: newStatus as ContentStatus },
        onSuccess: () => {
          // Update local state
          setMovies(movies.map((m: any) => (m.id === id ? { ...m, status: newStatus } : m)));
          toast.success(`Trạng thái phim đã được cập nhật thành ${newStatus}`);
        }
      })).unwrap();

    } catch (error) {
      console.error('Error updating movie status:', error);
      toast.error('Không cập nhật được trạng thái phim');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Calculate statistics
  const stats = {
    total: movies.length,
    published: movies.filter((m: any) => m.status === 'published').length,
    drafts: movies.filter((m: any) => m.status === 'draft').length,
    aiGenerated: movies.filter((m: any) => m.aiGenerated).length,
    featured: movies.filter((m: any) => m.isFeatured).length,
    totalViews: movies.reduce((acc, m) => acc + m.views, 0),
    totalLikes: movies.reduce((acc, m) => acc + m.likes, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Phim</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Link href="/movies/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Phim Mới
            </Button>
          </Link>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phim</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.aiGenerated} AI tạo ra ({Math.round((stats.aiGenerated / stats.total) * 100) || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.published / stats.total) * 100) || 0}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Nội dung chưa được công bố</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLikes.toLocaleString()} lượt thích
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {(searchQuery || statusFilter !== 'all' || genreFilter !== 'all') && (
              <Badge variant="secondary" className="ml-1">
                {[
                  searchQuery && 'search',
                  statusFilter !== 'all' && 'status',
                  genreFilter !== 'all' && 'genre'
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

            <Select disabled={categoriesLoading} value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger>
                <SelectValue placeholder={
                  categoriesLoading ? "Đang tải danh mục..." : "Chọn một danh mục"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((option) => (
                  <SelectItem key={option._id} value={option._id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Categories Error */}
            {categoriesError && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Lỗi khi tải danh mục: {categoriesError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(getCategoriesThunk())}
                    className="ml-auto"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm">Đang hiển thị:</span>
              <span className="text-sm font-medium">{filteredMovies.length} trong số {movies.length}</span>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setGenreFilter('all');
                setSortBy('newest');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Movies table */}
      <Card>
        <CardContent className="p-0">
          {loading && movies.length === 0 ? (
            <div className="flex h-80 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải phim...</p>
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
              <Film className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {movies.length === 0 ? 'Chưa có phim nào' : 'Không tìm thấy phim nào'}
              </h3>
              <p className="text-muted-foreground">
                {movies.length === 0
                  ? 'Tạo phim đầu tiên của bạn để bắt đầu'
                  : 'Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn'
                }
              </p>
              {movies.length === 0 && (
                <Link href="/movies/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phim đầu tiên của bạn
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div>
              {/* Bulk actions */}
              {selectedMovies.length > 0 && (
                <div className="flex items-center justify-between border-b bg-muted/50 p-4">
                  <p className="text-sm">
                    {selectedMovies.length} {selectedMovies.length === 1 ? 'movie' : 'movies'}{' '}
                    đã chọn
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMovies([])}>
                      Hủy bỏ
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Đang xóa...
                        </>
                      ) : (
                        'Xóa mục đã chọn'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Phim</TableHead>
                    <TableHead className="hidden md:table-cell">Các tập phim</TableHead>
                    <TableHead className="hidden md:table-cell">Thể loại</TableHead>
                    <TableHead className="hidden lg:table-cell">Lượt xem</TableHead>
                    <TableHead className="hidden lg:table-cell">Lượt thích</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.map((movie: any) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMovies.includes(movie.id)}
                          onCheckedChange={() => handleSelectMovie(movie.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted flex-shrink-0">
                            {movie.poster ? (
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                <Film className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{movie.title}</div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                              {movie.aiGenerated && (
                                <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                                  <Bot className="mr-1 h-3 w-3" />
                                  AI
                                </Badge>
                              )}
                              {movie.isFeatured && (
                                <Badge variant="outline" className="h-5 text-xs bg-yellow-500/10">
                                  Nổi bật
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Film className="h-4 w-4 text-muted-foreground" />
                          <span>{movie.episodes}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {movie.genre.slice(0, 2).map((g: any) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                          {movie.genre.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{movie.genre.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{movie.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span>❤️</span>
                          <span>{movie.likes.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={movie.status === 'published' ? 'default' : 'outline'}
                            className={movie.status === 'published' ? 'bg-green-500' : ''}
                          >
                            {movie.status}
                          </Badge>
                          {updatingStatus === movie.id && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/movies/${movie.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Xem chi tiết</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/movies/${movie.id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Chỉnh sửa</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {movie.status === 'draft' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(movie.id, 'published')}
                                disabled={updatingStatus === movie.id}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Xuất bản</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(movie.id, 'draft')}
                                disabled={updatingStatus === movie.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Hủy xuất bản</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => handleDeleteMovie(movie.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hộp thoại xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phim</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phim này không? Hành động này không thể hoàn tác và cũng sẽ xóa tất cả các tập liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMovie}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa phim'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hộp thoại xác nhận xóa nhiều phim */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhiều phim</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedMovies.length} {selectedMovies.length === 1 ? 'phim' : 'phim'}?
              Hành động này không thể hoàn tác và cũng sẽ xóa tất cả các tập liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                `Xóa ${selectedMovies.length} phim`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}