'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Film,
  Upload,
  TextSelect,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  Trash,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import ScriptAnalyzer from '@/components/movies/ScriptAnalyzer'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/app/redux/store'
import {
  createFilmThunk,
  createEpisodeThunk,
  generateEpisodesThunk,
  getEpisodesWithFilmThunk
} from '@/app/redux/film/thunk.film'
import { uploadToCloudinary } from '@/utils/upload.poster'
import { getCategoriesThunk } from '@/app/redux/categories/thunk.categories'


const ageRatingOptions = [
  { value: 'g', label: 'G - Dành cho mọi lứa tuổi' },
  { value: 'pg', label: 'PG - Khuyến nghị có sự hướng dẫn của phụ huynh' },
  { value: 'pg-13', label: 'PG-13 - Phụ huynh cần cân nhắc kỹ' },
  { value: 'r', label: 'R - Hạn chế, dưới 17 tuổi cần có người lớn đi kèm' },
  { value: 'nc-17', label: 'NC-17 - Chỉ dành cho người lớn (18+)' },
]

const AGE_RATINGS = [

];

// Empty episode template
const emptyEpisode = {
  title: '',
  description: '',
  thumbnail: null,
  duration: '',
  order: 0,
  isGenerating: false
}

export default function CreateMoviePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { loading, error, response, episodes } = useSelector((state: RootState) => state.film);
  const { categories } = useSelector(
    (state: RootState) => state.categories
  );

  const [activeTab, setActiveTab] = useState('details')
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [createdFilmId, setCreatedFilmId] = useState<string | null>(null)
  const [movieData, setMovieData] = useState<any>({
    title: '',
    description: '',
    poster: null,
    categories: [],
    ageRating: '',
    releaseDate: '',
    isAIGenerated: false,
    script: '',
    status: 'draft'
  })

  const [localEpisodes, setLocalEpisodes] = useState<any[]>([])
  const [scriptAnalysisMode, setScriptAnalysisMode] = useState(false)
  const [step, setStep] = useState(1)
  // 7. Complete component with state management
  const [isUploading, setIsUploading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategoriesThunk());
  }, [dispatch]);

  // Filter available categories (only active story categories)
  const availableCategories = categories.filter(
    category => category.isActive &&
      (category.type === 'movie' || category.type === 'both')
  );

  // Watch for Redux episodes changes
  useEffect(() => {
    if (episodes && episodes.length > 0) {
      setLocalEpisodes(episodes.map((ep: any, index: number) => ({
        ...ep,
        order: index,
        isGenerating: false
      })));
    }
  }, [episodes]);

  // Handle form field changes
  const handleChange = (field: any, value: any) => {
    setMovieData((prev: any) => ({ ...prev, [field]: value }))
  }

  // Handle category selection
  const handleCategoryChange = (category: any) => {
    if (movieData.categories.includes(category)) {
      handleChange('categories', movieData.categories.filter((c: any) => c !== category))
    } else {
      if (movieData.categories.length < 3) {
        handleChange('categories', [...movieData.categories, category])
      } else {
        toast.error('Bạn có thể chọn tối đa 3 danh mục')
      }
    }
  }

  const handlePosterUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      toast.error('Vui lòng tải lên một tập tin hình ảnh');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước tập tin phải nhỏ hơn 5MB');
      return;
    }

    // Show loading state
    setIsUploading(true);
    toast.loading('Đang tải áp phích lên...', { id: 'poster-upload' });

    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      console.log("imageUrl: ", imageUrl);

      // Update movie data with the Cloudinary URL
      handleChange('poster', imageUrl);

      toast.success('Tải poster lên thành công!', { id: 'poster-upload' });
    } catch (error) {
      console.error('Lỗi khi tải poster lên:', error);
      toast.error('Tải poster thất bại. Vui lòng thử lại.', { id: 'poster-upload' });
    } finally {
      setIsUploading(false);
    }
  };

  //// Hàm hỗ trợ tạo tập phim từ phản hồi AI
  const createEpisodesFromAI = (generatedEpisodes: any) => {
    const newEpisodes = generatedEpisodes.map((ep: any, index: any) => ({
      ...emptyEpisode,
      title: ep.title || `Tập ${index + 1}`,
      description: ep.description || '',
      order: index,
      duration: ep.duration || '30:00'
    }));

    setLocalEpisodes(newEpisodes);
    setActiveTab('episodes');
    toast.success(`${newEpisodes.length} tập phim đã được tạo`);
  }
  // Add empty episode manually
  const addEmptyEpisode = () => {
    setLocalEpisodes(prev => [
      ...prev,
      {
        ...emptyEpisode,
        order: localEpisodes.length,
        title: `Tập ${localEpisodes.length + 1}`
      }
    ]);
  }

  // Update specific episode
  const updateEpisode = (index: any, field: any, value: any) => {
    setLocalEpisodes(prev =>
      prev.map((ep, i) =>
        i === index ? { ...ep, [field]: value } : ep
      )
    )
  }

  // Delete episode
  const deleteEpisode = (index: any) => {
    setLocalEpisodes(prev => {
      const filtered = prev.filter((_, i) => i !== index)
      // Update order for remaining episodes
      return filtered.map((ep, i) => ({ ...ep, order: i }))
    })
  }

  // Move episode up/down
  const moveEpisode = (index: any, direction: any) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === localEpisodes.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1

    setLocalEpisodes(prev => {
      const newEpisodes = [...prev]
      const temp = { ...newEpisodes[index] }
      newEpisodes[index] = { ...newEpisodes[newIndex], order: index }
      newEpisodes[newIndex] = { ...temp, order: newIndex }
      return newEpisodes
    })
  }

  // Tạo lại tập phim cụ thể bằng AI
  const regenerateEpisode = async (index: any) => {
    if (!createdFilmId) {
      toast.error('Vui lòng lưu phim trước');
      return;
    }

    updateEpisode(index, 'isGenerating', true);

    try {
      // Sử dụng Redux thunk để tạo lại tập phim
      const episodeData: any = {
        filmId: createdFilmId,
        episodeIndex: index,
        script: movieData.script
      };

      const result = await dispatch(generateEpisodesThunk(episodeData)).unwrap();

      if (result && result.length > 0) {
        const regeneratedEpisode = result[0];
        updateEpisode(index, 'title', regeneratedEpisode.title);
        updateEpisode(index, 'description', regeneratedEpisode.description);
        updateEpisode(index, 'duration', regeneratedEpisode.duration);
        toast.success('Tạo lại tập phim thành công');
      }
    } catch (error) {
      console.error('Lỗi khi tạo lại tập phim:', error);
      toast.error('Tạo lại tập phim thất bại');
    } finally {
      updateEpisode(index, 'isGenerating', false);
    }
  };


  // Xử lý khi chuyển sang chế độ phân tích kịch bản bằng AI
  const startScriptAnalysis = () => {
    if (!movieData.title) {
      toast.error('Vui lòng nhập tiêu đề phim trước');
      return;
    }

    setScriptAnalysisMode(true);
    setStep(1);
  }

  // Xử lý phân tích kịch bản bằng AI
  const handleScriptAnalysis = async (scriptText: any) => {
    handleChange('script', scriptText);
    handleChange('isAIGenerated', true);

    try {
      // Tạo phim nếu chưa tồn tại
      let filmId = createdFilmId;

      if (!filmId) {
        const filmData = {
          ...movieData,
          script: scriptText,
          isAIGenerated: true,
          status: 'draft'
        };

        const filmResult = await dispatch(createFilmThunk(filmData)).unwrap();

        console.log("Kết quả phim: ", filmResult);
        filmId = filmResult.id;
        setCreatedFilmId(filmId);
      }

      // Tạo tập phim bằng Redux thunk
      const episodeGenerationData: any = {
        filmId: filmId,
        script: scriptText,
        episodeCount: 8, // Số lượng tập mặc định
        format: {
          includeTitle: true,
          includeDescription: true,
          includeDuration: true
        }
      };

      console.log("Phim đã tạo: ", createdFilmId);
      console.log("Dữ liệu phim: ", episodeGenerationData);

      const generatedEpisodes = await dispatch(generateEpisodesThunk(episodeGenerationData)).unwrap();

      if (generatedEpisodes && generatedEpisodes.length > 0) {
        createEpisodesFromAI(generatedEpisodes);
        setScriptAnalysisMode(false);
        toast.success(`${generatedEpisodes.length} tập phim đã được tạo thành công`);
      } else {
        // Dữ liệu giả phòng khi API thất bại
        const mockEpisodes = [
          {
            title: 'Khởi đầu',
            description: 'Nhân vật chính khám phá một tài năng tiềm ẩn sẽ thay đổi cuộc đời họ, bắt đầu một hành trình khám phá bản thân.',
            duration: '28:00'
          },
          {
            title: 'Chân trời mới',
            description: 'Bước vào vùng đất xa lạ, những đồng minh và kẻ thù mới xuất hiện khi mức độ căng thẳng tăng cao.',
            duration: '32:00'
          },
          // ... có thể thêm tập phim giả nếu cần
        ];
        createEpisodesFromAI(mockEpisodes);
        setScriptAnalysisMode(false);
      }
    } catch (error) {
      console.error('Lỗi khi phân tích kịch bản:', error);
      toast.error('Phân tích kịch bản thất bại: ' + (error as any)?.message || 'Lỗi không xác định');
      setScriptAnalysisMode(false);
    }
  };
  // Save individual episode
  const saveEpisode = async (episodeData: any) => {
    if (!createdFilmId) {
      toast.error('Vui lòng lưu phim trước');
      return;
    }

    try {
      const episodePayload = {
        ...episodeData,
        filmId: createdFilmId
      };

      await dispatch(createEpisodeThunk(episodePayload)).unwrap();
      toast.success('Lưu tập phim thành công');
    } catch (error) {
      console.error('Lỗi khi lưu tập phim:', error);
      toast.error('Lưu tập phim thất bại');
    }
  };

  // Hủy thay đổi và quay lại
  const handleDiscard = () => {
    router.push('/movies');
  };

  // Lưu phim
  const handleSave = async (status = 'draft') => {
    // Kiểm tra các trường bắt buộc
    if (!movieData.title) {
      toast.error('Vui lòng nhập tiêu đề phim');
      setActiveTab('details');
      return;
    }

    if (localEpisodes.length === 0) {
      toast.error('Vui lòng thêm ít nhất một tập phim');
      setActiveTab('episodes');
      return;
    }

    try {
      const filmData = {
        ...movieData,
        status
      };

      let filmId = createdFilmId;

      if (!filmId) {
        // Tạo phim mới
        const filmResult = await dispatch(createFilmThunk(filmData)).unwrap();
        filmId = filmResult.id;
        setCreatedFilmId(filmId);
      } else {
        // Cập nhật phim đã tồn tại - bạn có thể cần thêm `updateFilmThunk` vào danh sách thunks
        // await dispatch(updateFilmThunk({ id: filmId, data: filmData })).unwrap();
      }

      // Lưu tất cả tập phim
      for (const episode of localEpisodes) {
        if (!episode.id) { // Chỉ lưu các tập mới
          await saveEpisode({
            ...episode,
            filmId: filmId
          });
        }
      }

      toast.success(`Phim đã được ${status === 'published' ? 'xuất bản' : 'lưu'} thành công`);
      router.push('/movies');
    } catch (error) {
      console.error('Lỗi khi lưu phim:', error);
      toast.error('Lưu phim thất bại: ' + (error as any)?.message || 'Lỗi không xác định');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDiscardDialogOpen(true)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Tạo phim mới</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => handleSave('draft')}
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu bản nháp
          </Button>
          <Button
            disabled={loading}
            onClick={() => handleSave('published')}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Xuất bản
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hiển thị loading khi Redux đang xử lý */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang xử lý...</span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo lỗi nếu có lỗi từ Redux */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Lỗi: {error}</span>
          </div>
        </div>
      )}
      {scriptAnalysisMode ? (
        /* Script Analysis Mode */
        <ScriptAnalyzer
          movieData={movieData}
          onAnalyze={handleScriptAnalysis}
          onCancel={() => setScriptAnalysisMode(false)}
          step={step}
          setStep={setStep}
        />
      ) : (
        /* Normal Movie Creation Mode */
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Thông Tin Phim</TabsTrigger>
              <TabsTrigger value="episodes">
                Tập phim {localEpisodes.length > 0 && `(${localEpisodes.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Movie Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column - Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Cơ Bản</CardTitle>
                    <CardDescription>Nhập thông tin chính cho bộ phim của bạn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu Đề Phim *</Label>
                      <Input
                        id="title"
                        value={movieData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Nhập tiêu đề phim"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô Tả</Label>
                      <Textarea
                        id="description"
                        value={movieData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Nhập mô tả cho phim"
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categories">Thể Loại (chọn tối đa 3)</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((category) => (
                          <Badge
                            key={category._id}
                            variant={movieData.categories.includes(category._id) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleCategoryChange(category._id)}
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ageRating">Độ Tuổi</Label>
                        <Select
                          value={movieData.ageRating}
                          onValueChange={(value) => handleChange('ageRating', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn độ tuổi" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageRatingOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="releaseDate">Ngày Phát Hành</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={movieData.releaseDate}
                          onChange={(e) => handleChange('releaseDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Poster & AI */}
                <div className="space-y-6">
                  {/* Poster Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ảnh Poster Phim</CardTitle>
                      <CardDescription>Tải lên ảnh poster cho phim của bạn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/25">
                          {movieData.poster ? (
                            <>
                              <img
                                src={movieData.poster}
                                alt="Movie poster"
                                className="h-full w-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => handleChange('poster', null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Kích thước đề xuất: 600x900px
                              </p>

                            </div>
                          )}
                        </div>

                        <div className="flex justify-center">
                          <Label
                            htmlFor="poster-upload"
                            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            {movieData.poster ? 'Thay Đổi Poster' : 'Tải Lên Poster'}
                            <Input
                              id="poster-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePosterUpload}
                              disabled={isUploading}
                            />
                          </Label>

                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Dung lượng tối đa: 5MB
                          <br />
                          Hỗ trợ: JPG, PNG, WebP
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Script Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tạo Tập Phim Tự Động bằng AI</CardTitle>
                      <CardDescription>
                        Sử dụng AI để tự động tạo tập phim từ kịch bản
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="rounded-full bg-primary/20 p-3">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Tạo Tập Phim Tự Động</h3>
                          <p className="text-sm text-muted-foreground">
                            Dán kịch bản của bạn, AI sẽ phân tích và tạo tập phim
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="gap-2 w-full"
                          onClick={startScriptAnalysis}
                          disabled={loading}
                        >
                          <Wand2 className="h-4 w-4" />
                          Bắt Đầu Phân Tích Bằng AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tập phim</CardTitle>
                      <CardDescription>
                        {localEpisodes.length > 0
                          ? `${localEpisodes.length} episodes - Manage the episodes for this movie`
                          : 'Add episodes to your movie'}
                      </CardDescription>
                    </div>
                    <Button onClick={addEmptyEpisode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm Tập
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {localEpisodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                      <Film className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Chưa có tập nào</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Bắt đầu bằng cách thêm tập thủ công hoặc sử dụng AI để tạo chúng từ một tập lệnh
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button onClick={addEmptyEpisode}>
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm thủ công
                        </Button>
                        <Button
                          variant="outline"
                          onClick={startScriptAnalysis}
                          disabled={loading}
                        >
                          <Bot className="mr-2 h-4 w-4" />
                          Tạo ra với AI
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[600px]">
                      <div className="space-y-6">
                        {localEpisodes.map((episode, index) => (
                          <div
                            key={index}
                            className="group rounded-md border p-4 transition-colors hover:bg-accent/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                  {index + 1}
                                </div>
                                <h3 className="font-medium">{episode.title || `Tập phim ${index + 1}`}</h3>
                                {episode.isGenerating && (
                                  <Badge variant="outline" className="bg-amber-500/20">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Đang tạo...
                                  </Badge>
                                )}
                                {movieData.isAIGenerated && !episode.isGenerating && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    <Bot className="mr-1 h-3 w-3" />
                                    AI tạo ra
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEpisode(index, 'up')}
                                  disabled={index === 0}
                                  className="h-8 w-8"
                                >
                                  <ArrowLeft className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEpisode(index, 'down')}
                                  disabled={index === localEpisodes.length - 1}
                                  className="h-8 w-8"
                                >
                                  <ArrowLeft className="h-4 w-4 -rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteEpisode(index)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`episode-${index}-title`}>Tiêu đề tập phim</Label>
                                <Input
                                  id={`episode-${index}-title`}
                                  value={episode.title}
                                  onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                                  placeholder={`Tập phim ${index + 1}`}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`episode-${index}-duration`}>Khoảng thời gian</Label>
                                <Input
                                  id={`episode-${index}-duration`}
                                  value={episode.duration}
                                  onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                                  placeholder="HH:MM:SS"
                                />
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <Label htmlFor={`episode-${index}-description`}>Miêu tả</Label>
                              <Textarea
                                id={`episode-${index}-description`}
                                value={episode.description}
                                onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                                placeholder="Nhập mô tả tập phim"
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex-1">
                                <Label
                                  htmlFor={`episode-${index}-thumbnail`}
                                  className="mb-2 block text-sm"
                                >
                                  Hình ảnh thu nhỏ (tùy chọn)
                                </Label>
                                <div className="flex items-center gap-2">
                                  {episode.thumbnail ? (
                                    <div className="relative h-12 w-20 overflow-hidden rounded-md">
                                      <img
                                        src={episode.thumbnail.preview}
                                        alt={`Hình thu nhỏ cho ${episode.title}`}
                                        className="h-full w-full object-cover"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute right-1 top-1 h-5 w-5"
                                        onClick={() => updateEpisode(index, 'thumbnail', null)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex h-12 w-20 items-center justify-center rounded-md border border-dashed">
                                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <Label
                                    htmlFor={`thumbnail-upload-${index}`}
                                    className="cursor-pointer rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                                  >
                                    {episode.thumbnail ? 'Thay đổi' : 'Tải lên'}
                                    <Input
                                      id={`thumbnail-upload-${index}`}
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={(e: any) => {
                                        const file = e.target.files[0]
                                        if (!file) return
                                        if (!file.type.includes('image/')) {
                                          toast.error('Vui lòng tải lên tệp hình ảnh')
                                          return
                                        }
                                        updateEpisode(index, 'thumbnail', {
                                          file,
                                          preview: URL.createObjectURL(file)
                                        })
                                      }}
                                    />
                                  </Label>
                                </div>
                              </div>

                              {movieData.isAIGenerated && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  disabled={episode.isGenerating || loading}
                                  onClick={() => regenerateEpisode(index)}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Tái tạo
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
                {localEpisodes.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {localEpisodes.length} tập
                    </p>
                    <Button onClick={addEmptyEpisode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm Tập
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Discard Changes Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy bỏ các thay đổi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy bỏ các thay đổi của mình không? Không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscard}
            >
              Hủy bỏ thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}