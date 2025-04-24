'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  Bot,
  Film,
  CheckCircle2,
  XCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Mock data
const moviesData = [
  {
    id: 1,
    title: 'The Last Symphony',
    poster: '/images/movie1.jpg',
    episodes: 12,
    views: 2453,
    likes: 432,
    genre: ['Drama', 'Music'],
    status: 'published',
    aiGenerated: true,
    createdAt: '2024-04-20',
  },
  {
    id: 2,
    title: 'Eternal Journey',
    poster: '/images/movie2.jpg',
    episodes: 8,
    views: 1853,
    likes: 356,
    genre: ['Sci-Fi', 'Adventure'],
    status: 'published',
    aiGenerated: true,
    createdAt: '2024-04-18',
  },
  {
    id: 3,
    title: 'Mind Secrets',
    poster: '/images/movie3.jpg',
    episodes: 6,
    views: 1254,
    likes: 214,
    genre: ['Thriller', 'Mystery'],
    status: 'published',
    aiGenerated: false,
    createdAt: '2024-04-15',
  },
  {
    id: 4,
    title: 'Lost in Tokyo',
    poster: '/images/movie4.jpg',
    episodes: 10,
    views: 987,
    likes: 176,
    genre: ['Romance', 'Comedy'],
    status: 'draft',
    aiGenerated: true,
    createdAt: '2024-04-13',
  },
  {
    id: 5,
    title: "Winter's Shadow",
    poster: '/images/movie5.jpg',
    episodes: 7,
    views: 1532,
    likes: 289,
    genre: ['Horror', 'Supernatural'],
    status: 'published',
    aiGenerated: false,
    createdAt: '2024-04-10',
  },
  {
    id: 6,
    title: 'Silent Warriors',
    poster: '/images/movie6.jpg',
    episodes: 16,
    views: 2178,
    likes: 542,
    genre: ['Action', 'Historical'],
    status: 'published',
    aiGenerated: true,
    createdAt: '2024-04-08',
  },
  {
    id: 7,
    title: "Ocean's Whisper",
    poster: '/images/movie7.jpg',
    episodes: 5,
    views: 654,
    likes: 128,
    genre: ['Documentary', 'Nature'],
    status: 'draft',
    aiGenerated: false,
    createdAt: '2024-04-05',
  },
  {
    id: 8,
    title: 'Neon Heartbeat',
    poster: '/images/movie8.jpg',
    episodes: 8,
    views: 1857,
    likes: 321,
    genre: ['Cyberpunk', 'Action'],
    status: 'published',
    aiGenerated: true,
    createdAt: '2024-04-02',
  },
];

// Filter options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const genreOptions = [
  { value: 'all', label: 'All Genres' },
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'documentary', label: 'Documentary' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'views-high', label: 'Most Views' },
  { value: 'views-low', label: 'Least Views' },
  { value: 'likes-high', label: 'Most Likes' },
  { value: 'likes-low', label: 'Least Likes' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedMovies, setSelectedMovies] = useState<any>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Select all checkbox state
  const allSelected = movies.length > 0 && selectedMovies.length === movies.length;
  const someSelected = selectedMovies.length > 0 && selectedMovies.length < movies.length;

  // Fetch movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      // In a real app, this would be an API call
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMovies(moviesData);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Apply filters and sorting
  const filteredMovies = movies
    .filter((movie) => {
      // Apply search filter
      if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply status filter
      if (statusFilter !== 'all' && movie.status !== statusFilter) {
        return false;
      }

      // Apply genre filter
      if (genreFilter !== 'all' && !movie.genre.some((g) => g.toLowerCase() === genreFilter)) {
        return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
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
      setSelectedMovies(movies.map((movie) => movie.id));
    }
  };

  // Handle individual checkbox
  const handleSelectMovie = (id) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter((movieId) => movieId !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  // Handle delete movie
  const handleDeleteMovie = (id) => {
    setMovieToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete movie
  const confirmDeleteMovie = () => {
    setMovies(movies.filter((movie) => movie.id !== movieToDelete));
    setSelectedMovies(selectedMovies.filter((id) => id !== movieToDelete));
    setDeleteDialogOpen(false);
    setMovieToDelete(null);
    toast.success('Movie deleted successfully');
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedMovies.length === 0) return;

    setMovies(movies.filter((movie) => !selectedMovies.includes(movie.id)));
    setSelectedMovies([]);
    toast.success(`${selectedMovies.length} movies deleted successfully`);
  };

  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    setMovies(movies.map((movie) => (movie.id === id ? { ...movie, status: newStatus } : movie)));
    toast.success(`Movie status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
        <Link href="/movies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Movie
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Stats cards */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movies.length}</div>
            <p className="text-xs text-muted-foreground">
              {movies.filter((m) => m.aiGenerated).length} AI generated
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movies.filter((m) => m.status === 'published').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (movies.filter((m) => m.status === 'published').length / movies.length) * 100,
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movies.filter((m) => m.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">Unpublished content</p>
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
              placeholder="Search movies..."
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
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                {genreOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setGenreFilter('all');
                setSortBy('newest');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Movies table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
                <p className="text-sm text-muted-foreground">Loading movies...</p>
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
              <Film className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No movies found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div>
              {/* Bulk actions */}
              {selectedMovies.length > 0 && (
                <div className="flex items-center justify-between border-b bg-muted/50 p-4">
                  <p className="text-sm">
                    {selectedMovies.length} {selectedMovies.length === 1 ? 'movie' : 'movies'}{' '}
                    selected
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMovies([])}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      Delete
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
                    <TableHead>Movie</TableHead>
                    <TableHead className="hidden md:table-cell">Episodes</TableHead>
                    <TableHead className="hidden md:table-cell">Genre</TableHead>
                    <TableHead className="hidden md:table-cell">Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMovies.includes(movie.id)}
                          onCheckedChange={() => handleSelectMovie(movie.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 overflow-hidden rounded-md bg-muted">
                            {/* Image placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <Film className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{movie.title}</div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground">
                                {new Date(movie.createdAt).toLocaleDateString()}
                              </p>
                              {movie.aiGenerated && (
                                <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                                  <Bot className="mr-1 h-3 w-3" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{movie.episodes}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {movie.genre.map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{movie.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movie.status === 'published' ? 'default' : 'outline'}
                          className={movie.status === 'published' ? 'bg-green-500' : ''}
                        >
                          {movie.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/movies/${movie.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/movies/${movie.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {movie.status === 'draft' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(movie.id, 'published')}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Publish</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(movie.id, 'draft')}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Unpublish</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMovie(movie.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Movie</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this movie? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMovie}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
