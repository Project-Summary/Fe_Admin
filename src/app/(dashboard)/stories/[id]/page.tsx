"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Save,
  Trash2,
  Upload,
  BookOpen,
  Calendar,
  Eye,
  Tag,
  Pen,
  Plus,
  BookText,
  MessageSquare,
  Loader2,
  AlertCircle,
  X,
  Clock,
  Star,
  Heart,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  getStoryByIdThunk,
  updateStoryThunk,
  deleteStoryThunk
} from "@/app/redux/story/thunk.story";
import { getCategoriesThunk } from "@/app/redux/categories/thunk.categories";
import { UpdateStoryData } from "@/app/redux/story/interface.story";
import { ContentStatus } from "@/app/redux/film/interface.film";

const AGE_RATINGS = [
  { value: 'G', label: 'G - Dành cho mọi lứa tuổi' },
  { value: 'PG', label: 'PG - Khuyến nghị có sự hướng dẫn của phụ huynh' },
  { value: 'PG-13', label: 'PG-13 - Phụ huynh cần cân nhắc kỹ' },
  { value: 'R', label: 'R - Hạn chế, dưới 17 tuổi cần có người lớn đi kèm' },
  { value: 'NC-17', label: 'NC-17 - Chỉ dành cho người lớn (18+)' },
];
const LANGUAGES = [
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'es', label: 'Tiếng Tây Ban Nha' },
  { value: 'fr', label: 'Tiếng Pháp' },
  { value: 'de', label: 'Tiếng Đức' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'ko', label: 'Tiếng Hàn' },
  { value: 'zh', label: 'Tiếng Trung' },
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


export default function StoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Redux state
  const {
    currentStory,
    loading,
    error
  } = useSelector((state: RootState) => state.story);

  const {
    categories,
    loading: categoriesLoading
  } = useSelector((state: RootState) => state.categories);

  // Local state for form data
  const [formData, setFormData] = useState<UpdateStoryData>({});
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load story and categories on mount
  useEffect(() => {
    if (params.id) {
      dispatch(getStoryByIdThunk(params.id));
      dispatch(getCategoriesThunk());
    }
  }, [dispatch, params.id]);

  // Update form data when story loads
  useEffect(() => {
    if (currentStory) {
      setFormData({
        title: currentStory.title,
        description: currentStory.description,
        poster: currentStory.poster,
        backdrop: currentStory.backdrop,
        trailer: currentStory.trailer,
        releaseDate: currentStory.releaseDate ? new Date(currentStory.releaseDate) : undefined,
        duration: currentStory.duration,
        categories: currentStory.categories.map(cate => cate._id),
        ageRating: currentStory.ageRating,
        status: currentStory.status,
        // script: currentStory.script?.content,
        summary: currentStory.summary?.content,
        tags: currentStory.tags || [],
        language: currentStory.language,
        country: currentStory.country,
      });
    }
  }, [currentStory]);

  const availableCategories = categories.filter(
    category => category.isActive &&
      (category.type === 'story' || category.type === 'both')
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
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Image upload handlers
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp phải nhỏ hơn 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp hình ảnh');
      return;
    }

    setUploadingPoster(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, poster: imageUrl }));
      toast.success('Poster đã được tải lên thành công');
    } catch (error) {
      console.error('Lỗi khi tải lên poster:', error);
      toast.error('Không tải lên được poster');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBackdropUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp phải nhỏ hơn 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh');
      return;
    }

    setUploadingBackdrop(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, backdrop: imageUrl }));
      toast.success('Backdrop đã tải lên thành công');
    } catch (error) {
      console.error('Lỗi khi tải lên backdrop:', error);
      toast.error('Không tải lên được backdrop');
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

  const handleSelectChange = (name: keyof UpdateStoryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: keyof UpdateStoryData, value: string) => {
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

  // Category handlers
  const handleAddCategory = () => {
    if (activeCategory && !formData?.categories?.includes(activeCategory)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories as string[], activeCategory]
      }));
      setActiveCategory('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev?.categories?.filter(c => c !== categoryId)
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

  // Save story handler
  const handleSave = async () => {
    if (!currentStory) return;

    try {
      await dispatch(updateStoryThunk({
        id: currentStory._id,
        data: formData,
        onSuccess: () => {
          toast.success('Câu chuyện đã được cập nhật thành công');
        }
      })).unwrap();
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  // Delete story handler
  const handleDelete = async () => {
    if (!currentStory) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteStoryThunk({
        id: currentStory._id,
        onSuccess: () => {
          toast.success('Đã xóa câu chuyện thành công');
          router.push('/stories');
        }
      })).unwrap();
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Lỗi khi tải câu chuyện: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(getStoryByIdThunk(params.id))}
              className="ml-auto"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No story found
  if (!currentStory) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy câu chuyện</h1>
          <p className="text-muted-foreground mb-4">Câu chuyện bạn đang tìm kiếm không tồn tại.</p>
          <Button onClick={() => router.push('/stories')}>
            Quay lại Câu chuyện
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
          <Button variant="outline" size="icon" onClick={() => router.push("/stories")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Chỉnh sửa câu chuyện</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Xóa
          </Button>
          <Button
            className="gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="media">Phương tiện</TabsTrigger>
              <TabsTrigger value="content">Nội dung</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin câu chuyện</CardTitle>
                  <CardDescription>
                    Chỉnh sửa các chi tiết cơ bản cho câu chuyện này.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Tiêu đề câu chuyện</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      className="min-h-32"
                    />
                  </div>
                  {/* 
                  <div className="grid gap-2">
                    <Label htmlFor="script">Script/Content</Label>
                    <Textarea
                      id="script"
                      name="script"
                      value={formData.script || ''}
                      onChange={handleInputChange}
                      className="min-h-40"
                    />
                  </div> */}

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
                          <SelectValue placeholder="Select age rating" />
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
                          <SelectValue placeholder="Chọn ngôn ngữ" />
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
                    <Label htmlFor="trailer">URL đoạn giới thiệu</Label>
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
                    <Label>Thể loại</Label>
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
                        disabled={!activeCategory}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>

                  {/* Thẻ */}
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
                        Thêm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab phương tiện */}
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phương tiện & Hình ảnh</CardTitle>
                  <CardDescription>
                    Tải lên và quản lý hình ảnh câu chuyện.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Poster Section */}
                  <div className="space-y-4">
                    <Label>Poster</Label>
                    <div className="flex items-start gap-6">
                      <div className="relative w-40 h-60 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {formData.poster ? (
                          <>
                            <Image
                              src={formData.poster}
                              alt="Story poster"
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
                          <BookText className="h-10 w-10 text-muted-foreground" />
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
                              alt="Story backdrop"
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
                          <BookText className="h-8 w-8 text-muted-foreground" />
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
                          Tải lên Phông nền
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Kích thước đề xuất: 1920x1080px. Kích thước tệp tối đa: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung câu chuyện</CardTitle>
                  <CardDescription>
                    Xem trước và quản lý nội dung câu chuyện.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">Xem trước tập lệnh</p>
                    <div className="max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {currentStory.script?.content || 'Không có nội dung tập lệnh nào khả dụng.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm font-medium mb-2">Tóm tắt</p>
                    <div className="max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {currentStory.summary?.content || 'Không có nội dung tập lệnh nào khả dụng.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="word-count">Ước tính số từ</Label>
                    <div className="flex items-center">
                      <Input
                        id="word-count"
                        value={formData.script ? formData.script.split(' ').length.toLocaleString() : '0'}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-md text-center">
                      <p className="text-sm font-medium">Thời gian đọc ước tính</p>
                      <p className="text-2xl font-bold mt-2">
                        {formData.script ? Math.ceil(formData.script.split(' ').length / 200) : 0} phút
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Dựa trên 200 từ/phút</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-md text-center">
                      <p className="text-sm font-medium">Thời lượng</p>
                      <p className="text-2xl font-bold mt-2">
                        {formData.duration ? `${formData.duration} phút` : 'Chưa đặt'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Thời lượng câu chuyện</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Xem trước toàn bộ câu chuyện
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích hiệu suất</CardTitle>
                  <CardDescription>
                    Xem số liệu hiệu suất cho câu chuyện này.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Tổng số lượt xem</span>
                      </div>
                      <div className="text-2xl font-bold">{currentStory.statistics.views?.toLocaleString() || '0'}</div>
                    </div>

                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Xếp hạng trung bình</span>
                      </div>
                      <div className="text-2xl font-bold">{currentStory.averageRating?.toFixed(1) || 'N/A'}</div>
                    </div>

                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Lượt thích</span>
                      </div>
                      <div className="text-2xl font-bold">{currentStory.statistics.likes?.toLocaleString() || '0'}</div>
                    </div>
                  </div>

                  <div className="mt-6 h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">Chỗ giữ biểu đồ phân tích</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Phân tích chi tiết sẽ sớm có
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-md border">
                      <div className="p-4 border-b">
                        <h3 className="font-medium">Thống kê câu chuyện</h3>
                      </div>
                      <div className="divide-y">
                        <div className="flex justify-between items-center p-4">
                          <span>Ngày tạo</span>
                          <span className="text-muted-foreground">
                            {formatDate(currentStory.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <span>Cập nhật lần cuối</span>
                          <span className="text-muted-foreground">
                            {formatDate(currentStory.updatedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <span>Trạng thái</span>
                          <Badge variant={
                            currentStory.status === ContentStatus.PUBLISHED ? "default" :
                              currentStory.status === ContentStatus.ARCHIVED ? "secondary" : "outline"
                          }>
                            {currentStory.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <span>Ngôn ngữ</span>
                          <span className="text-muted-foreground">
                            {LANGUAGES.find(l => l.value === currentStory.language)?.label || 'Chưa đặt'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                          <span>Quốc gia</span>
                          <span className="text-muted-foreground">
                            {COUNTRIES.find(c => c.value === currentStory.country)?.label || 'Chưa đặt'}
                          </span>
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
              <CardTitle>Trạng thái câu chuyện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <Badge className="w-fit" variant={
                  currentStory.status === ContentStatus.PUBLISHED ? "default" :
                    currentStory.status === ContentStatus.ARCHIVED ? "secondary" : "outline"
                }>
                  {currentStory.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Cập nhật lần cuối vào {formatDate(currentStory.updatedAt)}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Ngày phát hành</p>
                    <p className="text-sm font-medium">{formatDate(currentStory.releaseDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Thời lượng</p>
                    <p className="text-sm font-medium">
                      {currentStory.duration ? `${currentStory.duration} phút` : 'Chưa đặt'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Xếp hạng độ tuổi</p>
                    <p className="text-sm font-medium">{currentStory.ageRating || 'Chưa xếp hạng'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Thể loại</p>
                    <p className="text-sm font-medium">{currentStory.categories?.length || 0} đã chọn</p>
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
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" />
                Xem trước câu chuyện
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => router.push(`/stories/${currentStory._id}/chapters`)}
              >
                <BookOpen className="h-4 w-4" />
                Quản lý chương
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Share2 className="h-4 w-4" />
                Chia sẻ câu chuyện
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa Câu chuyện
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Danh mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {currentStory.categories?.map((categoryId) => (
                  <Badge key={categoryId._id} variant="secondary">
                    {getCategoryName(categoryId.name)}
                  </Badge>
                )) || <p className="text-sm text-muted-foreground">Không có danh mục nào được chỉ định</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Thẻ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {currentStory.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                )) || <p className="text-sm text-muted-foreground">Không có thẻ nào được chỉ định</p>}
              </div>
            </CardContent>
          </Card>

          {/* Story Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Hiệu suất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Lượt xem</span>
                  </div>
                  <span className="font-medium">{currentStory.statistics.views?.toLocaleString() || '0'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Lượt thích</span>
                  </div>
                  <span className="font-medium">{currentStory.statistics.likes?.toLocaleString() || '0'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Xếp hạng</span>
                  </div>
                  <span className="font-medium">
                    {currentStory.averageRating ? `${currentStory.averageRating.toFixed(1)}/5` : 'Không được xếp hạng'}
                  </span>
                </div>

                {/* <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Bình luận</span>
                    </div>
                    <span className="font-medium">{currentStory.statistics.commentsCount?.toLocaleString() || '0'}</span>
                  </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

