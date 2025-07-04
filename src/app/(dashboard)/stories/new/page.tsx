'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Save,
  Upload,
  BookText,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { createStoryThunk, summaryStoryThunk } from '@/app/redux/story/thunk.story';
import { getCategoriesThunk } from '@/app/redux/categories/thunk.categories';
import { CreateStoryData } from '@/app/redux/story/interface.story';
import Image from 'next/image';
import { uploadToCloudinary } from '@/utils/upload.poster';
import { createScriptThunk } from '@/app/redux/script/thunk.script';
import { ContentStatus } from '@/app/redux/film/interface.film';

interface FormData {
  title: string;
  description: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  releaseDate?: Date;
  duration?: number;
  categories: string[];
  ageRating?: string;
  status: ContentStatus;
  script?: string;
  tags: string[];
  language?: string;
  country?: string;
}
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

export default function NewStoryPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Redux state
  const { loading: storyLoading } = useSelector((state: RootState) => state.story);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(
    (state: RootState) => state.categories
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categories: [],
    tags: [],
    status: ContentStatus.DRAFT,
    language: 'en',
    country: 'US',
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategoriesThunk());
  }, [dispatch]);

  // Filter available categories (only active story categories)
  const availableCategories = categories.filter(
    category => category.isActive &&
      (category.type === 'story' || category.type === 'both')
  );

  const filteredCategories = availableCategories.filter(
    category => !formData.categories.includes(category._id)
  );
  // Image upload handlers
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp phải nhỏ hơn 5MB');
      return;
    }

    // Xác thực loại tệp
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

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: keyof FormData, value: string) => {
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
    if (activeCategory && !formData.categories.includes(activeCategory)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, activeCategory]
      }));
      setActiveCategory('');
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== categoryId)
    }));
  };

  // Tag handlers
  const handleAddTag = () => {
    if (activeTag.trim() && !formData.tags.includes(activeTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, activeTag.trim()]
      }));
      setActiveTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeTag.trim() && !formData.tags.includes(activeTag.trim())) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // AI generation handler
  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);

    try {
      // Simulate AI generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setFormData(prev => ({
        ...prev,
        title: 'The Crystal Pathfinder',
        description: 'In a world divided by elemental magic, a young woman discovers she possesses a forbidden ability to communicate with the ancient crystal formations that power her civilization. As political tensions rise between the elemental factions, she must navigate dangerous alliances and uncover the truth about her mysterious powers before war consumes the land.',
        tags: ['fantasy', 'magic', 'adventure', 'political-intrigue'],
        duration: 120,
        ageRating: 'PG-13'
      }));

      toast.success('Chi tiết câu chuyện đã được tạo thành công!');
    } catch (error) {
      toast.error('Không tạo được chi tiết câu chuyện.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Yêu cầu nhập tiêu đề câu chuyện');
      setActiveTab('details');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Yêu cầu nhập mô tả câu chuyện');
      setActiveTab('details');
      return false;
    }

    if (formData.categories.length === 0) {
      toast.error('Yêu cầu nhập ít nhất một danh mục');
      setActiveTab('categorization');
      return false;
    }

    return true;
  };

  // Create story handler
  const handleCreateStory = async () => {
    if (!validateForm()) return;

    const scriptCreated = await dispatch(createScriptThunk({
      data: {
        title: formData.title,
        description: formData.description,
        content: formData.script || "",
        type: "story"
      }, onSuccess() {
      },
    }))

    const storyData: CreateStoryData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      poster: formData.poster,
      backdrop: formData.backdrop,
      trailer: formData.trailer,
      releaseDate: formData.releaseDate,
      duration: formData.duration,
      categories: formData.categories,
      ageRating: formData.ageRating,
      status: formData.status,
      script: scriptCreated.payload.data.data._id,
      tags: formData.tags,
      language: formData.language,
      country: formData.country,
    };

    const story = await dispatch(createStoryThunk({
      data: storyData,
      onSuccess: () => {
        toast.success('Đã tạo câu chuyện thành công');
      }
    })).unwrap();

    await dispatch(summaryStoryThunk({
      id: story.data.data.data._id, script: formData.script as string, onSuccess() {
        toast.success(`Câu chuyện ${formData.title} tóm tắt thành công`);
      },
    }))
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 4;

    if (formData.title.trim()) completed++;
    if (formData.description.trim()) completed++;
    if (formData.categories.length > 0) completed++;
    if (formData.poster || formData.backdrop) completed++;

    return (completed / total) * 100;
  };

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
          <Button variant="outline" size="icon" onClick={() => router.push('/stories')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Tạo Câu chuyện Mới</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Tự động Điền
          </Button>
          <Button
            className="gap-2"
            onClick={handleCreateStory}
            disabled={storyLoading}
          >
            {storyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Tạo Câu chuyện
          </Button>
        </div>
      </div>

      {/* Lỗi Danh mục */}
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

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tiến độ hoàn thành</span>
            <span className="text-sm text-muted-foreground">{Math.round(getCompletionPercentage())}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Chi tiết cơ bản</TabsTrigger>
          <TabsTrigger value="categorization">Phân loại</TabsTrigger>
          <TabsTrigger value="media">Phương tiện & Hình ảnh</TabsTrigger>
          <TabsTrigger value="publishing">Xuất bản</TabsTrigger>
        </TabsList>

        {/* Basic Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin câu chuyện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề câu chuyện *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề hấp dẫn cho câu chuyện của bạn"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Cung cấp mô tả chi tiết về câu chuyện của bạn"
                  className="min-h-32"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="script">Kịch bản/Nội dung</Label>
                <Textarea
                  id="script"
                  name="script"
                  value={formData.script || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập kịch bản hoặc nội dung câu chuyện"
                  className="min-h-40"
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorization Tab */}
        <TabsContent value="categorization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thể loại & Thẻ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories Section */}
              <div className="space-y-4">
                <Label>Danh mục *</Label>
                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                  {formData.categories.map((categoryId) => (
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
                  {formData.categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Không có danh mục nào được chọn. Hãy chọn ít nhất một danh mục.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={activeCategory}
                    onValueChange={setActiveCategory}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        categoriesLoading ? "Đang tải danh mục..." : "Chọn một danh mục"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleAddCategory}
                    disabled={!activeCategory || formData.categories.includes(activeCategory) || categoriesLoading}
                  >
                    Thêm
                  </Button>
                </div>
              </div>

              {/* Thẻ Phần */}
              <div className="space-y-4">
                <Label>Thẻ</Label>
                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                  {formData.tags.map((tag) => (
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
                  {formData.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Không có thẻ nào được thêm vào. Thẻ giúp người đọc khám phá câu chuyện của bạn.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập thẻ"
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!activeTag.trim() || formData.tags.includes(activeTag.trim())}
                  >
                    Thêm
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhấn Enter để thêm thẻ sau khi nhập hoặc nhấp vào nút Thêm.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media & Images Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phương tiện & Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phần Poster */}
              <div className="space-y-4">
                <Label>Hình ảnh Poster</Label>
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
                    <div className="space-y-2">
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
              </div>

              <Separator />

              {/* Backdrop Section */}
              <div className="space-y-4">
                <Label>Hình nền</Label>
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
                    <div className="space-y-2">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publishing Tab */}
        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái ban đầu</Label>
                <Select
                  value={formData.status}
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
                <p className="text-xs text-muted-foreground">
                  Bạn có thể thay đổi trạng thái sau khi tạo câu chuyện.
                </p>
              </div>

              {/* Publishing Checklist */}
              <div className="bg-muted/30 p-4 rounded-md">
                <h3 className="font-medium mb-3">Danh sách kiểm tra xuất bản</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.title.trim() ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Đã cung cấp tiêu đề truyện</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.description.trim() ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Mô tả được cung cấp</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.categories.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Ít nhất một danh mục được chọn</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.poster || formData.backdrop ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Ảnh bìa đã được tải lên</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.ageRating ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Xếp hạng độ tuổi đã được chọn</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${formData.language && formData.country ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    <p className="text-sm">Ngôn ngữ và quốc gia được chọn</p>
                  </div>
                </div>
              </div>
              {/* Story Summary */}
              <div className="bg-muted/20 p-4 rounded-md">
                <h3 className="font-medium mb-3">Tóm tắt câu chuyện</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tiêu đề:</span>
                    <p className="font-medium">{formData.title || 'Chưa thiết lập'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <p className="font-medium capitalize">{formData.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Danh mục:</span>
                    <p className="font-medium">{formData.categories.length} đã chọn</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thẻ:</span>
                    <p className="font-medium">{formData.tags.length} đã thêm</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thời lượng:</span>
                    <p className="font-medium">{formData.duration ? `${formData.duration} min` : 'Chưa đặt'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Xếp hạng độ tuổi:</span>
                    <p className="font-medium">{formData.ageRating || 'Chưa đặt'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngôn ngữ:</span>
                    <p className="font-medium">{LANGUAGES.find(l => l.value === formData.language)?.label || 'Chưa đặt'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quốc gia:</span>
                    <p className="font-medium">{COUNTRIES.find(c => c.value === formData.country)?.label || 'Chưa đặt'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateStory}
                disabled={storyLoading}
              >
                {storyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo Câu chuyện...
                  </>
                ) : (
                  'Tạo Câu chuyện'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
