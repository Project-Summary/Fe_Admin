// File: app/(dashboard)/ai-content/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader, Sparkles, FileText, Film, Book, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { getAllFeedbacksThunk } from "@/app/redux/feedback/thunk.feedback";
import { fetchAllSummarize, fetchTrain } from "@/app/redux/ai-model/request.ai-model";

export default function AIContentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [generating, setGenerating] = useState(false);
  const { feedbacks } = useSelector((state: RootState) => state.feedback);
  const { summaries, loading: summariesLoading } = useSelector((state: RootState) => state.aiModel);
  const [generationType, setGenerationType] = useState<any>();

  useEffect(() => {
    dispatch(getAllFeedbacksThunk({}));
    dispatch(fetchAllSummarize());
  }, [dispatch]);

  useEffect(() => {
    const ai = window.localStorage !== undefined ? localStorage.getItem('ai') : '';
    setGenerationType(ai);
  }, []);

  const handleGenerate = () => {
    if (feedbacks) {
      dispatch(fetchTrain({
        feedbacks: feedbacks.map((feedback) => feedback.content),
        useDbFeedbacks: true,
      }));
    }
  };

  // Transform summaries data for display
  const transformedHistory = summaries.map((summary, index) => ({
    id: summary.id || index,
    type: summary.genre || "unknown",
    title: `${summary.genre || "Content"} - Episodes: ${summary.total_episodes || 0}`,
    status: summary.quality_score > 0.7 ? "completed" : "error",
    date: summary.created_at ? new Date(summary.created_at).toLocaleDateString() : "N/A",
    tokens: Math.floor(summary.quality_score * 1000) || 0,
    qualityScore: summary.quality_score,
    averageRating: summary.average_rating,
    feedbackCount: summary.feedback_count
  }));

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tạo nội dung AI</h1>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => dispatch(fetchAllSummarize())}
          disabled={summariesLoading}
        >
          {summariesLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Làm mới Lịch sử
        </Button>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className={`grid ${generationType === 'ai-gemini' ? 'grid-cols-3' : 'grid-cols-2'} w-full max-w-md`}>
          <TabsTrigger value="generate">Tạo ra</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          {generationType === 'ai-gemini' && <TabsTrigger value="settings">Cài đặt</TabsTrigger>}
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tạo nội dung mới với AI</CardTitle>
              <CardDescription>
                Chọn loại nội dung bạn muốn tạo với sự hỗ trợ của AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer hover:border-primary transition-all ${generationType === "ai-training" ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => {
                    localStorage.setItem('ai', 'ai-training');
                    setGenerationType("ai-training")
                  }}
                >
                  <CardHeader className="pb-2">
                    <Book className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Đào tạo AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Tạo ra những câu chuyện hấp dẫn với cốt truyện phong phú và sự phát triển nhân vật.</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer hover:border-primary transition-all ${generationType === "ai-gemini" ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => {
                    localStorage.setItem('ai', 'ai-gemini');
                    setGenerationType("ai-gemini")
                  }}
                >
                  <CardHeader className="pb-2">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Gemini AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Tạo kịch bản cho các tập phim hiện có với các nhân vật thống nhất.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="gap-2"
                disabled={!generationType || generating}
                onClick={handleGenerate}
              >
                {generating ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Đào tạo AI
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử tạo</CardTitle>
              <CardDescription>
                Xem nội dung gần đây do AI tạo ra và trạng thái của chúng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summariesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Đang tải lịch sử...
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 font-medium border-b">
                    <div className="col-span-4">Tiêu đề</div>
                    <div className="col-span-2">Thể loại</div>
                    <div className="col-span-2">Chất lượng</div>
                    <div className="col-span-2">Ngày</div>
                    <div className="col-span-1 text-right">Xếp hạng</div>
                    <div className="col-span-1 text-right">Nhận xét</div>
                  </div>

                  <div className="divide-y">
                    {transformedHistory.length > 0 ? (
                      transformedHistory.map((item: any) => (
                        <div key={item.id} className="grid grid-cols-12 p-4 items-center">
                          <div className="col-span-4 font-medium">{item.title}</div>
                          <div className="col-span-2">
                            <Badge variant="outline" className="capitalize">
                              {item.type === "movie" ? <Film className="h-3 w-3 mr-1" /> :
                                item.type === "story" ? <Book className="h-3 w-3 mr-1" /> :
                                  <FileText className="h-3 w-3 mr-1" />}
                              {item.type}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <Badge
                              variant={item.status === "completed" ? "secondary" : "destructive"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {item.status === "completed" ?
                                <><CheckCircle className="h-3 w-3" /> Hoàn thành</> :
                                <><AlertCircle className="h-3 w-3" /> Thất bại</>}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-muted-foreground">{item.date}</div>
                          <div className="col-span-1 text-right text-muted-foreground">
                            {item.averageRating ? item.averageRating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="col-span-1 text-right text-muted-foreground">
                            {item.feedbackCount || 0}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Không tìm thấy lịch sử  tạo
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {generationType === 'ai-gemini' && (
          <TabsContent value="settings" className="space-y-4">
            {/* Settings content remains the same */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt AI Gemini</CardTitle>
                <CardDescription>
                  Cấu hình cài đặt API Gemini và tùy chọn tạo của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">Cấu hình API</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="api-key">Gemini API Key</Label>
                    <Input id="api-key" type="password" value="••••••••••••••••••••••••••••••" />
                    <p className="text-xs text-muted-foreground">Your API key được mã hóa và lưu trữ an toàn.</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="model">Mô hình Gemini</Label>
                    <Select defaultValue="gemini-1.5-pro">
                      <SelectTrigger id="model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                        <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="token-limit">Số lượng token tối đa cho mỗi thế hệ</Label>
                    <Select defaultValue="8000">
                      <SelectTrigger id="token-limit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4000">4,000 tokens</SelectItem>
                        <SelectItem value="8000">8,000 tokens</SelectItem>
                        <SelectItem value="16000">16,000 tokens</SelectItem>
                        <SelectItem value="32000">32,000 tokens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
