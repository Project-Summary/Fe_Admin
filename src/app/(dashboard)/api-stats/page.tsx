'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  Download,
  ExternalLink,
  RefreshCw,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Info,
  TrendingUp,
  Users,
  Star,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fetchStats } from '@/app/redux/ai-model/request.ai-model';

export default function ApiStatsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, statsLoading, error } = useSelector((state: RootState) => state.aiModel);
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  // Handle refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchStats()).unwrap();
      toast.success('Thống kê đã được làm mới thành công');
    } catch (error) {
      console.error('Không làm mới được số liệu thống kê', error);
      toast.error('Không làm mới được số liệu thống kê');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate mock data based on real stats for charts
  const generateChartData = () => {
    if (!stats) return null;

    // Generate weekly data based on current stats
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });

      return {
        name: dayName,
        summaries: Math.floor(stats.total_summaries_generated / 7 + Math.random() * 10),
        feedback: Math.floor(stats.total_feedback_received / 7 + Math.random() * 5),
        quality: stats.average_quality_score + (Math.random() - 0.5) * 0.2,
        rating: stats.average_user_rating + (Math.random() - 0.5) * 0.5,
      };
    });

    const feedbackDistribution = [
      { name: 'Positive', value: Math.floor(stats.total_feedback_received * 0.7), color: '#22c55e' },
      { name: 'Neutral', value: Math.floor(stats.total_feedback_received * 0.2), color: '#f59e0b' },
      { name: 'Negative', value: Math.floor(stats.total_feedback_received * 0.1), color: '#ef4444' },
    ];

    const qualityTrend = Array.from({ length: 6 }, (_, i) => ({
      week: `Week ${i + 1}`,
      quality: Math.max(0, Math.min(1, stats.average_quality_score + (Math.random() - 0.5) * 0.3)),
    }));

    return {
      weeklyData,
      feedbackDistribution,
      qualityTrend,
    };
  };

  const chartData = generateChartData();

  if (statsLoading && !stats) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải số liệu thống kê AI...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Không tải được số liệu thống kê AI</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Không có số liệu thống kê nào có sẵn</h3>
          <p className="text-muted-foreground">Vui lòng thử làm mới trang</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê đào tạo AI</h1>
          <p className="text-muted-foreground">Theo dõi và phân tích hiệu suất mô hình AI của bạn</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 giờ qua</SelectItem>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="90d">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing || statsLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Tải lại</span>
          </Button>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
        </div>
      </div>

      {/* AI Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng các bản tóm tắt</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_summaries_generated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Nội dung tóm tắt do AI tạo ra
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng phản hồi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_feedback_received.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.recent_feedback_count}</span> tuần này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Điểm chất lượng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.average_quality_score * 100).toFixed(1)}%</div>
            <Progress value={stats.average_quality_score * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá của người dùng</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_user_rating.toFixed(1)}/5</div>
            <div className="flex mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(stats.average_user_rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Các phiên đào tạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_training_sessions}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Tổng số phiên đào tạo AI đã hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Phiên bản AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.ai_version}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Phiên bản mô hình hiện tại
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Cập nhật lần cuối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(stats.last_updated).toLocaleDateString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(stats.last_updated).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="feedback">Nhận xét</TabsTrigger>
          <TabsTrigger value="training">Đào tạo</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {chartData && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Tổng quan hoạt động hàng tuần</CardTitle>
                  <CardDescription>Tóm tắt được tạo ra và phản hồi nhận được theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="summaries"
                          name="Tóm tắt"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="feedback"
                          name="Nhận xét"
                          fill="#82ca9d"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phân phối phản hồi</CardTitle>
                  <CardDescription>Phân tích cảm nhận phản hồi của người dùng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.feedbackDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.feedbackDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng chất lượng</CardTitle>
                  <CardDescription>Điểm chất lượng AI theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.qualityTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip formatter={(value: any) => `${(value * 100).toFixed(1)}%`} />
                        <Line
                          type="monotone"
                          dataKey="quality"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Số liệu hiệu suất</CardTitle>
                <CardDescription>Các chỉ số hiệu suất chính cho mô hình AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Điểm chất lượng</span>
                    <span>{(stats.average_quality_score * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.average_quality_score * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sự hài lòng của người dùng</span>
                    <span>{((stats.average_user_rating / 5) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.average_user_rating / 5) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Phản hồi Cam kết</span>
                    <span>{Math.min(100, (stats.recent_feedback_count / stats.total_feedback_received) * 100 * 7).toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(100, (stats.recent_feedback_count / stats.total_feedback_received) * 100 * 7)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiệu quả đào tạo</CardTitle>
                <CardDescription>Thống kê phiên đào tạo AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tổng số phiên</span>
                    <Badge variant="secondary">{stats.total_training_sessions}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cải thiện chất lượng trung bình</span>
                    <Badge variant="secondary">+{(stats.average_quality_score * 10).toFixed(1)}%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tỷ lệ thành công</span>
                    <Badge variant="secondary">{(stats.average_quality_score * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt phản hồi</CardTitle>
                <CardDescription>Phân tích phản hồi và xu hướng của người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto">
                        <ThumbsUp className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {Math.round((stats.average_user_rating / 5) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Tích cực</p>
                    </div>

                    <div className="text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mx-auto">
                        <ThumbsDown className="h-8 w-8 text-red-500" />
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {Math.round(100 - (stats.average_user_rating / 5) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Tiêu cực</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Phản hồi gần đây</span>
                      <span>{stats.recent_feedback_count} tuần này</span>
                    </div>
                    <Progress value={(stats.recent_feedback_count / stats.total_feedback_received) * 100 * 7} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin phản hồi</CardTitle>
                <CardDescription>Những phản hồi của người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Cải thiện chất lượng</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Điểm chất lượng đã được cải thiện bởi {(stats.average_quality_score * 10).toFixed(1)}% trong các phiên đào tạo gần đây.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Hoạt động cộng đồng</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats.recent_feedback_count} phản hồi mới được gửi trong tuần này, cho thấy sự tương tác tích cực của người dùng.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Sự hài lòng cao</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Đánh giá trung bình của {stats.average_user_rating.toFixed(1)}/5 biểu thị sự hài lòng cao của người dùng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Tình trạng đào tạo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex rounded-full bg-green-500/20 p-3">
                    <Brain className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="mt-2 font-medium">Mô hình v{stats.ai_version}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cập nhật lần cuối: {new Date(stats.last_updated).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tiến trình đào tạo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hoàn thành</span>
                    <span>{(stats.average_quality_score * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.average_quality_score * 100} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Dựa trên số liệu chất lượng và phản hồi
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Đào tạo tiếp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {stats.recent_feedback_count >= 10 ? 'Sẵn sàng' : 'Chưa giải quyết'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.recent_feedback_count >= 10
                      ? 'Đã thu thập đủ phản hồi'
                      : `Cần thêm ${10 - stats.recent_feedback_count} phản hồi`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
