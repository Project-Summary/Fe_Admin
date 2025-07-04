'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  ArrowRight,
  Wand2,
  X,
  Upload,
  File,
  Sparkles,
  ChevronLeft,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { createEpisodeThunk, createFilmThunk, generateEpisodesThunk } from '@/app/redux/film/thunk.film';
import { useRouter } from 'next/navigation';
import { fetchSummarize } from '@/app/redux/ai-model/request.ai-model';

export default function ScriptAnalyzer({
  movieData,
  onAnalyze,
  onCancel,
  step,
  setStep,
  filmId,
}: {
  movieData: any;
  onAnalyze: any;
  onCancel: any;
  step: any;
  setStep: any;
  filmId?: string | null;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, response } = useSelector((state: RootState) => state.film);
  const router = useRouter();
  const [script, setScript] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(8);
  const [episodeFormat, setEpisodeFormat] = useState({
    includeTitle: true,
    includeDescription: true,
    includeDuration: true,
  });
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [generatedEpisodes, setGeneratedEpisodes] = useState<any[]>([]);

  // Watch for Redux loading and response changes
  useEffect(() => {
    if (analysisStarted && !loading && response) {
      // Analysis completed successfully
      if (response.data && Array.isArray(response.data)) {
        setGeneratedEpisodes(response.data);
        setProcessingProgress(100);
        setProcessingStatus('Phân tích hoàn tất!');
        setStep(3);
        setAnalysisStarted(false);
      }
    }
  }, [loading, response, analysisStarted, setStep]);

  // Watch for Redux error
  useEffect(() => {
    if (error && analysisStarted) {
      toast.error('Phân tích không thành công: ' + error);
      setAnalysisStarted(false);
      setStep(1);
      setProcessingProgress(0);
      setProcessingStatus('');
    }
  }, [error, analysisStarted, setStep]);

  // Simulate progress when loading
  useEffect(() => {
    if (loading && analysisStarted) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 3;
        setProcessingProgress(Math.min(progress, 95));

        // Update status messages based on progress
        if (progress === 15) {
          setProcessingStatus('Đang phân tích nội dung tập lệnh...');
        } else if (progress === 35) {
          setProcessingStatus('Đang xác định cấu trúc tường thuật...');
        } else if (progress === 55) {
          setProcessingStatus('Đang tạo phân tích tập phim...');
        } else if (progress === 75) {
          setProcessingStatus('Đang hoàn thiện chi tiết tập phim...');
        } else if (progress >= 90) {
          setProcessingStatus('Gần xong rồi...');
        }

        if (progress >= 95 || !loading) {
          clearInterval(interval);
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [loading, analysisStarted]);

  // Handle file upload with proper file reading
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a text, PDF, or Word document');
      return;
    }
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    try {
      // Read file content based on file type
      let fileContent = '';

      if (file.type === 'text/plain') {
        fileContent = await file.text();
      } else {
        // For PDF and DOC files, in a real app you would use proper parsing libraries
        // For now, we'll use a placeholder
        fileContent = `[Nội dung từ ${file.name}]

          Nội dung này sẽ chứa văn bản thực tế được trích xuất từ ​​tệp đã tải lên.
          Trong ứng dụng sản xuất, bạn sẽ sử dụng các thư viện như:
          - pdf-parse cho tệp PDF
          - mammoth cho tệp DOCX
          - Hoặc gửi đến dịch vụ phụ trợ để xử lý

          Đối với mục đích demo, đây là nội dung mẫu...

          FADE IN:

          EXT. CITY STREET - NIGHT
          Mưa rơi trên con phố mờ tối. MỘT HÌNH ẢNH trong chiếc áo khoác dài bước đi có mục đích.

          NGƯỜI DẪN CHƯƠNG TRÌNH (GIỌNG NÓI)
          Thành phố có hàng ngàn câu chuyện. Đây chỉ là một trong số đó.

          Hình ảnh dừng lại, nhìn lên biển hiệu neon: "MIDNIGHT LOUNGE"

          INT. MIDNIGHT LOUNGE - NIGHT
          Phòng chờ đầy khói, nửa trống. NHẠC JAZZ phát ra nhẹ nhàng. Hình ảnh bước vào, tháo mũ để lộ THÁM TỬ MORGAN (40 tuổi).

          BARTENDER
          Như thường lệ?

          THÁM TỬ MORGAN
          (gật đầu)
          Một đêm dài. Và sắp dài hơn nữa.

          Một NGƯỜI PHỤ NỮ bí ẩn mặc đồ đỏ bước vào. Mọi ánh mắt đổ dồn về phía cô ấy.

          THÁM TỬ MORGAN (GIỌNG NÓI)
          Và đó là lúc tôi biết rắc rối vừa mới ập đến...`;
      }

      setScript(fileContent);
      setIsReady(fileContent.length > 100);
      toast.success('Tệp đã được tải lên và xử lý thành công');
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Không đọc được nội dung tệp');
    }
  };

  // Handle script text change
  const handleScriptChange = (e: any) => {
    setScript(e.target.value);
    setIsReady(e.target.value.length > 100); // Simple validation
  };
  // Handle analysis with Redux
  const handleAnalysis = async () => {
    if (!isReady || !script.trim()) {
      toast.error('Vui lòng cung cấp một tập lệnh trước');
      return;
    }
    try {
      if (!filmId) {
        const filmData = {
          ...movieData,
          script: script.trim(),
          isAIGenerated: true,
          status: 'draft'
        }

        const filmResult = await dispatch(createFilmThunk({
          data: filmData, onSuccess() {
            toast.success("Tạo nên thành công cho bộ phim");
          },
        })).unwrap();
        filmId = filmResult.data.data._id
        setStep(2);
        setProcessingProgress(0);
        setProcessingStatus('Đang khởi tạo...');
        // Prepare data for Redux thunk
        const analysisData: any = {
          script: script.trim(),
          episodeCount,
          format: episodeFormat,
          filmId: filmId || null,
          movieTitle: movieData.title || 'Phim Không Tên',
        };
        const ai = window.localStorage !== undefined ? localStorage.getItem('ai') : '';

        if (ai === 'ai-gemini') {
          // Dispatch the generateEpisodesThunk
          await dispatch(generateEpisodesThunk({
            id: filmId as string, data: analysisData, onSuccess() {
              toast.success("Tạo các tập phim thành công");
              setAnalysisStarted(false);
              setStep(1);
            },
          }));
        } else if (ai === 'ai-training') {
          const response = await dispatch(fetchSummarize({ script: script.trim(), episodeNumber: episodeCount }));
          const episodes = response.payload?.data?.episodes ?? [];
          if (episodes.length > 0) {
            await episodes.map((ep: any) =>
              dispatch(createEpisodeThunk({
                id: filmId as string,
                data: {
                  title: ep.title,
                  description: ep.summary,
                  episodeNumber: ep.episode_number,
                },
                onSuccess() {
                },
              }))
            )
          }
          router.push('/movies');
        }
      } else {
        toast.error("Không có thời gian để thêm phim");
        router.back();
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Không thể bắt đầu phân tích tập lệnh');
      setAnalysisStarted(false);
      setStep(1);
    }
  };

  // Handle final submit
  const handleSubmit = () => {
    if (generatedEpisodes.length > 0) {
      onAnalyze({
        script,
        episodes: generatedEpisodes,
        episodeCount,
        format: episodeFormat,
      });
    } else {
      // Fallback with script data
      onAnalyze(script);
    }
  };

  // Reset states when cancelled
  const handleCancel = () => {
    setAnalysisStarted(false);
    setProcessingProgress(0);
    setProcessingStatus('');
    setGeneratedEpisodes([]);
    onCancel();
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bước 1: Nhập tập lệnh</h2>
              <Badge variant="outline" className="text-xs">
                Phim: {movieData.title || 'Không có tiêu đề'}
              </Badge>
            </div>

            {/* Show error if exists */}
            {error && (
              <Alert className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Script Text Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Nhập Kịch Bản</CardTitle>
                  <CardDescription>
                    Dán kịch bản, lời thoại hoặc dàn ý câu chuyện chi tiết của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Dán kịch bản của bạn vào đây..."
                    className="min-h-[300px]"
                    value={script}
                    onChange={handleScriptChange}
                    disabled={loading}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    {script ? `${script.length} ký tự` : 'Chưa nhập nội dung'}
                  </p>
                  {script && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScript('');
                        setIsReady(false);
                      }}
                      className="gap-1"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                      Xóa
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Or Upload File */}
              <Card>
                <CardHeader>
                  <CardTitle>Tải Lên Tệp Kịch Bản</CardTitle>
                  <CardDescription>Tải lên tệp văn bản, PDF hoặc Word</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-3">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(uploadedFile.size / 1024)} KB
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setScript('');
                          setIsReady(false);
                        }}
                        disabled={loading}
                      >
                        Xóa Tệp
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-6">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Kéo thả tệp vào đây hoặc nhấn để chọn</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Hỗ trợ các định dạng TXT, PDF và DOC
                        </p>
                      </div>
                      <Label
                        htmlFor="script-upload"
                        className={`cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Tải Tệp Lên
                        <Input
                          id="script-upload"
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          className="sr-only"
                          onChange={handleFileUpload}
                          disabled={loading}
                        />
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tùy Chọn Tạo Tập Phim</CardTitle>
                <CardDescription>Tùy chỉnh cách AI sẽ phân tích kịch bản của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="episode-count">Số Lượng Tập Phim</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="episode-count"
                        type="number"
                        min="1"
                        max="20"
                        value={episodeCount}
                        onChange={(e) =>
                          setEpisodeCount(Math.max(1, Math.min(20, Number(e.target.value))))
                        }
                        disabled={loading}
                      />
                      <span className="text-sm text-muted-foreground">tập</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gợi ý: 5–12 tập cho hầu hết các câu chuyện
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Chi Tiết Cần Tạo Trong Mỗi Tập</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-title"
                          checked={episodeFormat.includeTitle}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeTitle: !episodeFormat.includeTitle,
                            })
                          }
                          disabled={loading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-title" className="text-sm">
                          Tạo tiêu đề cho mỗi tập
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-description"
                          checked={episodeFormat.includeDescription}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeDescription: !episodeFormat.includeDescription,
                            })
                          }
                          disabled={loading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-description" className="text-sm">
                          Tạo mô tả cho mỗi tập
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-duration"
                          checked={episodeFormat.includeDuration}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeDuration: !episodeFormat.includeDuration,
                            })
                          }
                          disabled={loading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-duration" className="text-sm">
                          Gợi ý thời lượng cho mỗi tập
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertTitle>Phân tích bằng AI</AlertTitle>
              <AlertDescription>
                AI sẽ phân tích kịch bản của bạn và đề xuất cấu trúc tập phim hợp lý dựa trên dòng chảy câu chuyện và nội dung.
                Bạn có thể xem lại và chỉnh sửa tất cả các gợi ý trước khi hoàn tất.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bước 2: Xử lý bằng AI</h2>

            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <div className="rounded-full bg-primary/20 p-4">
                    {loading ? (
                      <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    ) : (
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Đang phân tích kịch bản của bạn</h3>
                    <p className="text-muted-foreground mb-6">
                      AI đang phân tích và chia nhỏ kịch bản thành {episodeCount} tập
                    </p>

                    <div className="max-w-md mx-auto space-y-4">
                      <Progress value={processingProgress} className="h-2" />
                      <p className="text-sm font-medium">{processingStatus || 'Đang khởi tạo...'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" disabled={loading} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <Button variant="ghost" onClick={handleCancel} disabled={loading} className="gap-1">
                Hủy
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bước 3: Phân tích hoàn tất</h2>

            <Card className="border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
                  <div className="rounded-full bg-green-600/20 p-4">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Phân tích kịch bản thành công</h3>
                    <p className="text-muted-foreground mb-4">
                      AI đã phân tích kịch bản và tạo ra {generatedEpisodes.length || episodeCount} tập
                    </p>

                    <div className="flex gap-4 justify-center">
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{generatedEpisodes.length || episodeCount}</p>
                        <p className="text-xs text-muted-foreground">Số tập</p>
                      </div>
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{Math.round(script.length / 100)}</p>
                        <p className="text-xs text-muted-foreground">Số trang kịch bản</p>
                      </div>
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-muted-foreground">Hoàn tất</p>
                      </div>
                    </div>

                    {/* Xem trước các tập đã tạo */}
                    {generatedEpisodes.length > 0 && (
                      <div className="mt-6 w-full">
                        <h4 className="text-lg font-semibold mb-3">Xem trước các tập đã tạo</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {generatedEpisodes.slice(0, 3).map((episode, index) => (
                            <div key={index} className="bg-muted/50 rounded-md p-2 text-left">
                              <p className="font-medium text-sm">Tập {index + 1}: {episode.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {episode.description}
                              </p>
                            </div>
                          ))}
                          {generatedEpisodes.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              ...và {generatedEpisodes.length - 3} tập khác
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-500">Sẵn sàng tạo nội dung chi tiết</AlertTitle>
                  <AlertDescription>
                    Nhấn "Tạo tập phim" để tạo nội dung chi tiết dựa trên phân tích này. Bạn có thể chỉnh sửa kết quả sau đó.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end w-full">
                  <Button onClick={handleSubmit} className="gap-2">
                    <Bot className="h-4 w-4" />
                    Tạo tập phim
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="gap-1">
                Hủy
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            1
          </div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {loading && step === 2 ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              '2'
            )}
          </div>
          <div className={`h-1 flex-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            3
          </div>
        </div>
      </div>

      {/* Main content */}
      <div>{renderStepContent()}</div>

      {/* Navigation buttons */}
      {step === 1 && (
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleAnalysis} disabled={!isReady || loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Phân tích kịch bản
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}