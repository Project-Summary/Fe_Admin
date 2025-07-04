"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  Save,
  Trash2,
  Film,
  Clock,
  Calendar,
  ListChecks,
  Tag,
  Upload,
  Play,
  Edit,
  Plus,
  Loader2,
  AlertCircle,
  Heart,
  Eye,
  Star,
  X,
  Users,
  Video
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AppDispatch, RootState } from '@/app/redux/store';
import {
  getFilmByIdThunk,
  updateFilmThunk,
  deleteFilmThunk,
  getEpisodesWithFilmThunk,
  deleteEpisodeThunk,
  incrementViewThunk,
  likeFilmThunk,
  rateFilmThunk
} from '@/app/redux/film/thunk.film';
import { getCategoriesThunk } from "@/app/redux/categories/thunk.categories";
import { StoriesCategories } from "@/app/redux/story/interface.story";
import { ContentStatus, IMappingMovie, UpdateMovieData } from "@/app/redux/film/interface.film";

// Age rating options
const AGE_RATINGS = [
  { value: 'G', label: 'G - Đối tượng chung' },
  { value: 'PG', label: 'PG - Hướng dẫn của phụ huynh' },
  { value: 'PG-13', label: 'PG-13 - Phụ huynh được cảnh báo mạnh mẽ' },
  { value: 'R', label: 'R - Hạn chế' },
  { value: 'NC-17', label: 'NC-17 - Chỉ dành cho người lớn' },
];

// Language options
const LANGUAGES = [
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'es', label: 'Tiếng Tây Ban Nha' },
  { value: 'fr', label: 'Tiếng Pháp' },
  { value: 'de', label: 'Tiếng Đức' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'ko', label: 'Hàn Quốc' },
  { value: 'zh', label: 'Tiếng Trung Quốc' },
];

// Country options
const COUNTRIES = [
  { value: 'US', label: 'Hoa Kỳ' },
  { value: 'VN', label: 'Việt Nam' },
  { value: 'UK', label: 'Vương quốc Anh' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Úc' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'CN', label: 'Trung Quốc' },
];

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Redux state
  const {
    loading,
    error,
    selectedFilm,
    episodes
  } = useSelector((state: RootState) => state.film);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useSelector((state: RootState) => state.categories);

  // Local state
  const [formData, setFormData] = useState<UpdateMovieData>({});
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newActor, setNewActor] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (params.id) {
      dispatch(getFilmByIdThunk(params.id));
      dispatch(getEpisodesWithFilmThunk(params.id));
      dispatch(getCategoriesThunk());
    }
  }, [dispatch, params.id]);

  // Update form data when movie loads
  useEffect(() => {
    if (selectedFilm?.data?.data) {
      const movieData = selectedFilm.data.data;
      setFormData({
        title: movieData.title,
        description: movieData.description,
        script: movieData.script,
        poster: movieData.poster,
        backdrop: movieData.backdrop,
        trailer: movieData.trailer,
        releaseDate: movieData.releaseDate ? new Date(movieData.releaseDate) : undefined,
        duration: movieData.duration,
        categories: movieData.categories?.map((cat: StoriesCategories) => cat._id) || [],
        ageRating: movieData.ageRating,
        status: movieData.status as ContentStatus,
        tags: movieData.tags || [],
        language: movieData.language,
        country: movieData.country,
        // directors: movieData.directors || [],
        // actors: movieData.actors || [],
        isFeatured: movieData.isFeatured,
        isNew: movieData.isNew,
        isAIGenerated: movieData.isAIGenerated,
      });
    }
  }, [selectedFilm]);

  // Get current movie data
  const currentMovie = selectedFilm?.data?.data as IMappingMovie;

  // Filter available categories
  const availableCategories = categories.filter(
    category => category.isActive &&
      (category.type === 'movie' || category.type === 'both') &&
      !formData.categories?.includes(category._id)
  );

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formDataUpload,
      }
    );

    if (!response.ok) {
      throw new Error('Không tải được hình ảnh lên');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Image upload handlers
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tập tin phải nhỏ hơn 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tập tin hình ảnh');
      return;
    }

    setUploadingPoster(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, poster: imageUrl }));
    } catch (error) {
      console.error('Error uploading poster:', error);
      toast.error('Không tải được poster lên');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBackdropUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tập tin phải nhỏ hơn 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tập tin hình ảnh');
      return;
    }

    setUploadingBackdrop(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, backdrop: imageUrl }));
    } catch (error) {
      console.error('Error uploading backdrop:', error);
      toast.error('Không tải được phông nền');
    } finally {
      setUploadingBackdrop(false);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof UpdateMovieData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: keyof UpdateMovieData, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setFormData(prev => ({
      ...prev,
      releaseDate: date
    }));
  };

  const handleSwitchChange = (name: keyof UpdateMovieData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Category handlers
  const handleAddCategory = () => {
    if (activeCategory && !formData.categories?.includes(activeCategory)) {
      if ((formData.categories?.length || 0) >= 3) {
        toast.error("Tối đa 3 danh mục được phép");
        return;
      }
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), activeCategory]
      }));
      setActiveCategory('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.filter(c => c !== categoryId) || []
    }));
  };

  // Tag handlers
  const handleAddTag = () => {
    if (activeTag.trim() && !formData.tags?.includes(activeTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), activeTag.trim()]
      }));
      setActiveTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeTag.trim() && !formData.tags?.includes(activeTag.trim())) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Director handlers
  const handleAddDirector = () => {
    if (newDirector.trim() && !formData.directors?.includes(newDirector.trim())) {
      setFormData(prev => ({
        ...prev,
        directors: [...(prev.directors || []), newDirector.trim()]
      }));
      setNewDirector('');
    }
  };

  const handleRemoveDirector = (director: string) => {
    setFormData(prev => ({
      ...prev,
      directors: prev.directors?.filter(d => d !== director) || []
    }));
  };

  const handleDirectorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newDirector.trim() && !formData.directors?.includes(newDirector.trim())) {
      e.preventDefault();
      handleAddDirector();
    }
  };

  // Actor handlers
  const handleAddActor = () => {
    if (newActor.trim() && !formData.actors?.includes(newActor.trim())) {
      setFormData(prev => ({
        ...prev,
        actors: [...(prev.actors || []), newActor.trim()]
      }));
      setNewActor('');
    }
  };

  const handleRemoveActor = (actor: string) => {
    setFormData(prev => ({
      ...prev,
      actors: prev.actors?.filter(a => a !== actor) || []
    }));
  };

  const handleActorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newActor.trim() && !formData.actors?.includes(newActor.trim())) {
      e.preventDefault();
      handleAddActor();
    }
  };

  // Save movie handler
  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error('Tiêu đề phim là bắt buộc');
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(updateFilmThunk({
        id: params.id,
        data: formData,
        onSuccess: () => {
          toast.success("Phim đã được cập nhật thành công");
        }
      })).unwrap();
    } catch (error) {
      console.error('Lỗi khi cập nhật phim:', error);
      toast.error('Không cập nhật được phim');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete movie handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteFilmThunk({
        id: params.id, onSuccess() {

        },
      })).unwrap();
      toast.success("Movie deleted successfully");
      router.push("/movies");
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Không xóa được phim');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete episode handler
  const handleDeleteEpisode = async (episodeId: string) => {
    try {
      await dispatch(deleteEpisodeThunk({
        id: params.id,
        epId: episodeId,
        onSuccess: () => {
          toast.success("Tập phim đã được xóa thành công");
          dispatch(getEpisodesWithFilmThunk(params.id));
        }
      })).unwrap();
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Không thể xóa tập phim');
    }
  };

  // Action handlers
  const handleLikeMovie = async () => {
    try {
      await dispatch(likeFilmThunk(params.id)).unwrap();
      dispatch(getFilmByIdThunk(params.id));
      toast.success("Phim đã thích");
    } catch (error) {
      console.error('Error liking movie:', error);
      toast.error('Không thích phim');
    }
  };

  const handleRateMovie = async (rating: number) => {
    try {
      await dispatch(rateFilmThunk(params.id)).unwrap();
      dispatch(getFilmByIdThunk(params.id));
      toast.success(`Đã xếp hạng ${rating} sao`);
    } catch (error) {
      console.error('Error rating movie:', error);
      toast.error('Không thể đánh giá phim');
    }
  };

  const handlePreviewMovie = async () => {
    try {
      await dispatch(incrementViewThunk(params.id)).unwrap();
      toast.success("Mở bản xem trước phim...");
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Helper functions
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Chưa thiết lập';
    return new Date(date).toLocaleDateString();
  };

  // Loading state
  if (loading && !selectedFilm) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải thông tin chi tiết về phim...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedFilm) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Lỗi khi tải phim:{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(getFilmByIdThunk(params.id))}
              className="ml-auto"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No movie found
  if (!currentMovie) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy phim</h1>
          <p className="text-muted-foreground mb-4">Bộ phim bạn đang tìm không tồn tại.</p>
          <Button onClick={() => router.push('/movies')}>
            Quay lại danh sách Phim
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={posterInputRef}
        onChange={handlePosterUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={backdropInputRef}
        onChange={handleBackdropUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/movies")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Chỉnh sửa phim</h1>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Xóa bỏ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa Phim</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa không? "{currentMovie.title}"? Không thể hoàn tác hành động này.
                  <br />
                  Tất cả các tập phim và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang xóa...
                    </>
                  ) : (
                    'Xóa phim'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Lỗi: {error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="media">Phương tiện</TabsTrigger>
              <TabsTrigger value="episodes">
                Tập phim {episodes?.length > 0 && `(${episodes.length})`}
              </TabsTrigger>
              <TabsTrigger value="cast">Diễn viên & Đoàn làm phim</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Chỉnh sửa những chi tiết chính cho bộ phim này.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Tên phim *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề phim"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Sự miêu tả</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      className="min-h-32"
                      placeholder="Nhập mô tả phim"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="script">Kịch bản/Nội dung</Label>
                    <Textarea
                      id="script"
                      name="script"
                      value={formData.script || ''}
                      onChange={handleInputChange}
                      className="min-h-40"
                      placeholder="Nhập kịch bản hoặc nội dung phim"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="releaseDate">Ngày phát hành</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={formData.releaseDate ? formData.releaseDate.toISOString().split('T')[0] : ''}
                        onChange={handleDateChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="duration">Thời lượng (phút)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration || ''}
                        onChange={(e) => handleNumberChange('duration', e.target.value)}
                        placeholder="120"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="ageRating">Xếp hạng độ tuổi</Label>
                      <Select
                        value={formData.ageRating || ''}
                        onValueChange={(value) => handleSelectChange('ageRating', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn xếp hạng độ tuổi" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RATINGS.map((rating) => (
                            <SelectItem key={rating.value} value={rating.value}>
                              {rating.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="language">Ngôn ngữ</Label>
                      <Select
                        value={formData.language || ''}
                        onValueChange={(value) => handleSelectChange('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="country">Quốc gia</Label>
                      <Select
                        value={formData.country || ''}
                        onValueChange={(value) => handleSelectChange('country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quốc gia" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="trailer">Video giới thiệu</Label>
                    <Input
                      id="trailer"
                      name="trailer"
                      type="url"
                      value={formData.trailer || ''}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={formData.status || ContentStatus.DRAFT}
                      onValueChange={(value) => handleSelectChange('status', value as ContentStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ContentStatus.DRAFT}>Bản nháp</SelectItem>
                        <SelectItem value={ContentStatus.PUBLISHED}>Đã xuất bản</SelectItem>
                        <SelectItem value={ContentStatus.ARCHIVED}>Đã lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    <Label>Thể loại (tối đa 3)</Label>
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                      {formData.categories?.map((categoryId) => (
                        <Badge key={categoryId} variant="secondary" className="gap-1 px-3 py-1">
                          {getCategoryName(categoryId)}
                          <button
                            className="ml-2 text-xs hover:text-destructive"
                            onClick={() => handleRemoveCategory(categoryId)}
                            type="button"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={activeCategory}
                        onValueChange={setActiveCategory}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn một danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={handleAddCategory}
                        disabled={!activeCategory || (formData.categories?.length || 0) >= 3}
                      >
                        Thêm vào
                      </Button>
                    </div>
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
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <Label>Thẻ</Label>
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                      {formData.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1 px-3 py-1">
                          {tag}
                          <button
                            className="ml-2 text-xs hover:text-destructive"
                            onClick={() => handleRemoveTag(tag)}
                            type="button"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a tag"
                        value={activeTag}
                        onChange={(e) => setActiveTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!activeTag.trim()}
                      >
                        Thêm vào
                      </Button>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4 pt-4">
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={formData.isFeatured || false}
                          onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                        />
                        <Label htmlFor="featured">Phim nổi bật</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="new"
                          checked={formData.isNew || false}
                          onCheckedChange={(checked) => handleSwitchChange('isNew', checked)}
                        />
                        <Label htmlFor="new">Đánh dấu là bản phát hành mới</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="aiGenerated"
                          checked={formData.isAIGenerated || false}
                          onCheckedChange={(checked) => handleSwitchChange('isAIGenerated', checked)}
                        />
                        <Label htmlFor="aiGenerated">Nội dung do AI tạo ra</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phương tiện & Hình ảnh</CardTitle>
                  <CardDescription>
                    Tải lên và quản lý hình ảnh và đoạn giới thiệu phim.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Poster Section */}
                  <div className="space-y-4">
                    <Label>Hình ảnh áp phích</Label>
                    <div className="flex items-start gap-6">
                      <div className="relative w-40 h-60 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {formData.poster ? (
                          <>
                            <Image
                              src={formData.poster}
                              alt="Movie poster"
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, poster: undefined }))}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <Film className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => posterInputRef.current?.click()}
                          disabled={uploadingPoster}
                        >
                          {uploadingPoster ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Tải lên Poster
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Kích thước đề xuất: 800x1200px. Kích thước tệp tối đa: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Backdrop Section */}
                  <div className="space-y-4">
                    <Label>Hình ảnh nền</Label>
                    <div className="flex items-start gap-6">
                      <div className="relative w-60 h-36 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {formData.backdrop ? (
                          <>
                            <Image
                              src={formData.backdrop}
                              alt="Movie backdrop"
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, backdrop: undefined }))}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <Film className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => backdropInputRef.current?.click()}
                          disabled={uploadingBackdrop}
                        >
                          {uploadingBackdrop ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Tải lên phông nền
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Kích thước đề xuất: 1920x1080px. Kích thước tệp tối đa: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trailer Section */}
                  <Separator />
                  <div className="space-y-4">
                    <Label>Xem trước đoạn giới thiệu</Label>
                    <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      <div className="text-center">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {formData.trailer ? 'Trailer URL set' : 'No trailer URL'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 gap-2"
                          onClick={handlePreviewMovie}
                          disabled={!formData.trailer}
                        >
                          <Play className="h-4 w-4" />
                          Xem trước
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Tập phim</CardTitle>
                    <CardDescription>
                      Quản lý tất cả các tập phim của bộ phim này.
                    </CardDescription>
                  </div>
                  <Button
                    className="gap-2"
                    onClick={() => router.push(`/movies/${params.id}/episodes/create`)}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm Tập
                  </Button>
                </CardHeader>
                <CardContent>
                  {episodes && episodes.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
                        <div className="col-span-5">Tiêu đề</div>
                        <div className="col-span-2">Khoảng thời gian</div>
                        <div className="col-span-2">Trạng thái</div>
                        <div className="col-span-3 text-right">Hành động</div>
                      </div>
                      <div className="divide-y">
                        {episodes.map((episode: any) => (
                          <div key={episode._id} className="grid grid-cols-12 p-4 items-center hover:bg-muted/30">
                            <div className="col-span-5">
                              <div className="font-medium">{episode.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Tập phim {episode.episodeNumber || 'N/A'}
                              </div>
                            </div>
                            <div className="col-span-2 text-sm">
                              {episode.duration ? `${episode.duration} min` : 'N/A'}
                            </div>
                            <div className="col-span-2">
                              <Badge variant={episode.isPublished ? "default" : "secondary"}>
                                {episode.isPublished ? "Đã xuất bản" : "Bản nháp"}
                              </Badge>
                            </div>
                            <div className="col-span-3 text-right flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push(`/movies/episodes/${episode._id}`)}
                              >
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa Tập</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa không? "{episode.title}"? Không thể hoàn tác hành động này.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEpisode(episode.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Xóa Tập
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Chưa có tập nào</h3>
                      <p className="text-muted-foreground mb-4">Bắt đầu bằng cách thêm tập đầu tiên của bạn.</p>
                      <Button onClick={() => router.push(`/movies/${params.id}/episodes/create`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm Tập Đầu Tiên
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cast & Crew Tab */}
            <TabsContent value="cast" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diễn viên & Đoàn làm phim</CardTitle>
                  <CardDescription>
                    Quản lý đạo diễn, diễn viên và các thành viên đoàn làm phim khác.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Directors Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <h3 className="font-medium">Giám đốc</h3>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter director name"
                        value={newDirector}
                        onChange={(e) => setNewDirector(e.target.value)}
                        onKeyDown={handleDirectorKeyDown}
                      />
                      <Button
                        onClick={handleAddDirector}
                        disabled={!newDirector.trim()}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.directors?.map((director, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                          <span className="font-medium">{director}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDirector(director)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!formData.directors || formData.directors.length === 0) && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Chưa có giám đốc nào được thêm vào.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Actors Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <h3 className="font-medium">Diễn viên</h3>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter actor name"
                        value={newActor}
                        onChange={(e) => setNewActor(e.target.value)}
                        onKeyDown={handleActorKeyDown}
                      />
                      <Button
                        onClick={handleAddActor}
                        disabled={!newActor.trim()}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.actors?.map((actor, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                          <span className="font-medium">{actor}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveActor(actor)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(!formData.actors || formData.actors.length === 0) && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          Chưa có diễn viên nào được thêm vào.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích hiệu suất</CardTitle>
                  <CardDescription>
                    Xem số liệu hiệu suất của bộ phim này.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Tổng số lượt xem</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {currentMovie.statistics?.views?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Đánh giá trung bình</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {currentMovie?.averageRating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateMovie(star)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            <Star
                              className={`h-4 w-4 ${star <= (currentMovie?.averageRating || 0) ? 'fill-current' : ''
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Thích</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {currentMovie.statistics?.likes?.toLocaleString() || '0'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 gap-1 text-red-500 hover:text-red-600"
                        onClick={handleLikeMovie}
                      >
                        <Heart className="h-3 w-3" />
                        Thích phim
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">Trình giữ chỗ biểu đồ phân tích</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Phân tích chi tiết sẽ sớm có sẵn
                      </p>
                    </div>
                  </div>

                  {/* Additional Analytics Info */}
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Số liệu tương tác</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tạo:</span>
                          <span>{formatDate(currentMovie.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                          <span>{formatDate(currentMovie.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tập phim:</span>
                          <span>{currentMovie.totalEpisodes || episodes?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Chi tiết nội dung</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trạng thái:</span>
                          <Badge variant={
                            currentMovie.status === "published" ? "default" :
                              currentMovie.status === "draft" ? "secondary" : "outline"
                          }>
                            {currentMovie.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI tạo ra:</span>
                          <span>{currentMovie.isAIGenerated ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Thể loại:</span>
                          <span>{currentMovie.categories?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tình trạng phim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <Badge className="w-fit" variant={
                  currentMovie.status === "published" ? "default" :
                    currentMovie.status === "draft" ? "secondary" : "outline"
                }>
                  {currentMovie.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Cập nhật lần cuối vào {formatDate(currentMovie.updatedAt)}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Ngày phát hành</p>
                    <p className="text-sm font-medium">{formatDate(currentMovie.releaseDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Khoảng thời gian</p>
                    <p className="text-sm font-medium">
                      {formData.duration ? `${formData.duration} minutes` : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Tập phim</p>
                    <p className="text-sm font-medium">
                      {currentMovie.totalEpisodes || episodes?.length || 0} các tập phim
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Thể loại</p>
                    <p className="text-sm font-medium">{currentMovie.categories?.length || 0} đã chọn</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handlePreviewMovie}
              >
                <Play className="h-4 w-4" />
                Xem trước phim
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => router.push(`/movies/${params.id}/episodes/create`)}
              >
                <Plus className="h-4 w-4" />
                Thêm Tập Mới
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLikeMovie}
              >
                <Heart className="h-4 w-4" />
                Thích như phim
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Thể loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {currentMovie.categories?.map((category: StoriesCategories) => (
                  <Badge key={category._id} variant="secondary">
                    {category.name}
                  </Badge>
                )) || <p className="text-sm text-muted-foreground">Không có danh mục nào được chỉ định</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tóm tắt hiệu suất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lượt xem</span>
                <span className="font-medium">
                  {currentMovie.statistics?.views?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Thích</span>
                <span className="font-medium">
                  {currentMovie.statistics?.likes?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Xếp hạng</span>
                <div className="flex item-center gap-1">
                  <Star className=" w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {currentMovie?.averageRating?.toFixed(1) || 'N/A'}/5
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tập phim</span>
                <span className="font-medium">
                  {currentMovie.totalEpisodes || episodes?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

