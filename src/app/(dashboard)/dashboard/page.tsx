'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import Link from 'next/link';
import {
  Film,
  BookOpen,
  Users,
  Bot,
  Eye,
  Clock,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Equal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Import thunks
import { getAllFilmsThunk } from '@/app/redux/film/thunk.film';
import { getAllStoriesThunk, getRecentStoriesThunk } from '@/app/redux/story/thunk.story';
import { getAllUsersThunk, getUserStatisticsThunk } from '@/app/redux/users/thunk.users';
import { getAllScriptsThunk } from '@/app/redux/script/thunk.script';
import { fetchStats } from '@/app/redux/ai-model/request.ai-model';

// Stats Card Component
function StatCard({
  icon,
  title,
  value,
  trend,
  href,
}: {
  icon?: any;
  title?: any;
  value?: any;
  trend?: any;
  href?: any;
}) {
  let TrendIcon;
  let trendColor;

  if (trend === 'up') {
    TrendIcon = TrendingUp;
    trendColor = 'text-green-500';
  } else if (trend === 'down') {
    TrendIcon = TrendingDown;
    trendColor = 'text-red-500';
  } else {
    TrendIcon = Equal;
    trendColor = 'text-muted-foreground';
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
        <div className="flex items-center pt-1 text-xs">
          <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
          <span className={trendColor}>+12.5%</span>
          <span className="text-muted-foreground ml-1">Từ tháng trước</span>
        </div>
        {href && (
          <div className="pt-3">
            <Link href={href}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Xem chi tiết <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);

  // Redux selectors
  const { films, loading: filmsLoading } = useSelector((state: RootState) => state.film);
  const {
    stories,
    recentStories,
    loading: storiesLoading
  } = useSelector((state: RootState) => state.story);
  const {
    users,
    statistics: userStats,
    loading: usersLoading
  } = useSelector((state: RootState) => state.users);
  const { stats: aiStats, statsLoading } = useSelector((state: RootState) => state.aiModel);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Dispatch all thunks to fetch data
        await Promise.all([
          dispatch(getAllFilmsThunk()),
          dispatch(getAllStoriesThunk({})),
          dispatch(getRecentStoriesThunk({ limit: 3 })),
          dispatch(getAllUsersThunk()),
          dispatch(getAllScriptsThunk()),
          dispatch(fetchStats()),
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  // Calculate stats from real data
  const totalVisits = userStats?.totalViews || 0;
  const totalUsers = users?.length || 0;
  const totalMovies = films?.length || 0;
  const totalStories = stories?.length || 0;
  const aiContentGenerated = aiStats?.total_summaries_generated || 0;
  const dailyApiCalls = 1238; // This would come from API stats

  // Get recent movies (films)
  const recentMovies = films?.slice(0, 3).map(film => ({
    id: film._id,
    title: film.title,
    thumbnail: film.poster || '/images/default-movie.jpg',
    episodes: film.episodes.length || 0,
    views: film.statistics.views || 0,
    likes: film.statistics.likes || 0,
    aiGenerated: film.isAIGenerated || false,
    date: film.createdAt,
    status: film.status,
  })) || [];

  // Get recent users with proper data
  const recentUsers = users?.slice(0, 3).map(user => ({
    id: user._id,
    name: user.fullName || user.username,
    email: user.email,
    avatar: user.avatar || '/avatars/default.jpg',
    joinDate: user.createdAt,
    lastActive: user.lastLoginAt || user.updatedAt,
    contentViewed: user.preferences?.viewHistory?.length || 0,
  })) || [];

  // Mock popular searches (this would come from analytics)
  const popularSearches = [
    { term: 'sci-fi movies', count: 756 },
    { term: 'romance novel', count: 542 },
    { term: 'action thriller', count: 498 },
    { term: 'fantasy stories', count: 387 },
    { term: 'detective mystery', count: 354 },
  ];

  // API usage data (would come from API monitoring)
  const apiUsage = {
    limit: 10000,
    used: 5432,
    errorRate: 2.3,
    lastUpdated: '5 phút trước',
    trend: '+12% so với ngày hôm qua',
  };

  if (isLoading || filmsLoading || storiesLoading || usersLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <div className="flex items-center gap-2">
          <Button>Tạo báo cáo</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-4 w-4" />}
          title="Tổng số lượt truy cập"
          value={totalVisits}
          trend="up"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          title="Tổng số người dùng"
          value={totalUsers}
          trend="up"
          href="/users"
        />
        <StatCard
          icon={<Film className="h-4 w-4" />}
          title="Phim"
          value={totalMovies}
          trend="up"
          href="/movies"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          title="Truyện"
          value={totalStories}
          trend="up"
          href="/stories"
        />
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="users">Người sử dụng</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* AI Generated Content Card */}
            <Card>
              <CardHeader>
                <CardTitle>Nội dung do AI tạo ra</CardTitle>
                <CardDescription>Tổng số nội dung được tạo bằng Gemini API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{aiContentGenerated}</p>
                      <p className="text-xs text-muted-foreground">Phim truyện được tóm tắt</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-green-500">
                      {aiStats?.recent_feedback_count || 0} tuần này
                    </Badge>
                    <Link href="/ai-content">
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Xem tất cả nội dung AI
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sử dụng API Gemini</CardTitle>
                <CardDescription>
                  Gọi API hàng ngày: {dailyApiCalls} / {apiUsage.limit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <Progress
                    value={(apiUsage.used / apiUsage.limit) * 100}
                    className="h-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {apiUsage.used} Đã gọi (
                    {Math.round((apiUsage.used / apiUsage.limit) * 100)}%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Đã cập nhật {apiUsage.lastUpdated}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm">
                      Tỷ lệ lỗi: <span className="font-medium">{apiUsage.errorRate}%</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{apiUsage.trend}</p>
                  </div>
                  <Link href="/api-stats">
                    <Button variant="secondary" size="sm">
                      Xem số liệu thống kê API
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Searches Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm phổ biến</CardTitle>
              <CardDescription>Người dùng đang tìm kiếm điều gì</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularSearches.map((search, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {i + 1}
                      </div>
                      <p className="font-medium">{search.term}</p>
                    </div>
                    <p className="text-muted-foreground">{search.count} tìm kiếm</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Recent Movies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Phim mới nhất</CardTitle>
                  <Link href="/movies">
                    <Button variant="ghost" size="sm">
                      Xem tất cả
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead className="text-right">Tập phim</TableHead>
                      <TableHead className="text-right">Lượt xem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovies.length > 0 ? recentMovies.map((movie) => (
                      <TableRow key={movie.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 overflow-hidden rounded">
                              {movie.thumbnail ? (
                                <img
                                  src={movie.thumbnail}
                                  alt={movie.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <Film className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{movie.title}</div>
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(movie.date).toLocaleDateString()}
                                </p>
                                {movie.aiGenerated && (
                                  <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                                    AI
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="h-5 text-xs">
                                  {movie.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{movie.episodes}</TableCell>
                        <TableCell className="text-right">{movie.views.toLocaleString()}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Không tìm thấy phim nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Stories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Những câu chuyện gần đây</CardTitle>
                  <Link href="/stories">
                    <Button variant="ghost" size="sm">
                      Xem tất cả
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead className="text-right">Lượt xem</TableHead>
                      <TableHead className="text-right">Xếp hạng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStories.length > 0 ? recentStories.map((story) => (
                      <TableRow key={story._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 overflow-hidden rounded">
                              {story.poster ? (
                                <img
                                  src={story.poster}
                                  alt={story.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                  <Film className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{story.title}</div>
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(story.createdAt).toLocaleDateString()}
                                </p>
                                {story.isAIGenerated && (
                                  <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                                    AI
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="h-5 text-xs">
                                  {story.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{story.statistics.views?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-right">{story.averageRating?.toFixed(1) || 'N/A'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Không tìm thấy câu chuyện nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Content Creation Button */}
          <div className="flex justify-center">
            <div className="w-full max-w-md p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              <div className="flex flex-col items-center text-center">
                <Bot className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-1">Tạo nội dung mới</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sử dụng Gemini AI để tạo các tập phim hoặc truyện
                </p>
                <div className="flex gap-3">
                  <Link href="/movies/new">
                    <Button>
                      <Film className="mr-2 h-4 w-4" />
                      Phim Mới
                    </Button>
                  </Link>
                  <Link href="/stories/new">
                    <Button variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Câu chuyện mới
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng gần đây</CardTitle>
              <CardDescription>Người dùng mới tham gia hoặc hoạt động gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người sử dụng</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead>Hoạt động cuối cùng</TableHead>
                    <TableHead className="text-right">Nội dung đã xem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.length > 0 ? recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(user.lastActive).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.contentViewed}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Không tìm thấy người dùng
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Link href="/users">
                  <Button>Xem tất cả người dùng</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gọi API hàng ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dailyApiCalls.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((apiUsage.used / apiUsage.limit) * 100)}% giới hạn hàng ngày
                </p>
                <Progress
                  value={(apiUsage.used / apiUsage.limit) * 100}
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ lỗi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiUsage.errorRate}%</div>
                <p className="text-xs text-muted-foreground">+0.5% từ hôm quay</p>
                <Progress value={apiUsage.errorRate * 5} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Điểm chất lượng AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">
                    {aiStats?.average_quality_score ?
                      `${(aiStats.average_quality_score * 100).toFixed(1)}%` :
                      'N/A'
                    }
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Xếp hạng trung bình:{aiStats?.average_user_rating?.toFixed(1) || 'N/A'}/5
                </p>
                <div className="mt-4">
                  <Link href="/api-stats">
                    <Button variant="outline" size="sm" className="w-full">
                      Xem số liệu thống kê chi tiết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê đào tạo AI</CardTitle>
              <CardDescription>Tóm tắt hiệu suất của mô hình AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{aiStats?.total_summaries_generated || 0}</p>
                  <p className="text-sm text-muted-foreground">Tóm tắt được tạo ra</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{aiStats?.total_feedback_received || 0}</p>
                  <p className="text-sm text-muted-foreground">Phản hồi đã nhận</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{aiStats?.total_training_sessions || 0}</p>
                  <p className="text-sm text-muted-foreground">Các phiên đào tạo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{aiStats?.ai_version || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Phiên bản AI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
