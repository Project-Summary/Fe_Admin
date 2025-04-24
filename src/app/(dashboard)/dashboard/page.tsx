'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Film,
  BookOpen,
  Users,
  Bot,
  Eye,
  ThumbsUp,
  MessageSquare,
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

// This would typically come from an API
const mockData = {
  stats: {
    totalVisits: 15423,
    totalUsers: 2874,
    totalMovies: 156,
    totalStories: 89,
    aiContentGenerated: 245,
    dailyApiCalls: 1238,
  },
  recentMovies: [
    {
      id: 1,
      title: 'The Last Symphony',
      thumbnail: '/images/movie1.jpg',
      episodes: 12,
      views: 2453,
      likes: 432,
      aiGenerated: true,
      date: '2024-04-20',
    },
    {
      id: 2,
      title: 'Eternal Journey',
      thumbnail: '/images/movie2.jpg',
      episodes: 8,
      views: 1853,
      likes: 356,
      aiGenerated: true,
      date: '2024-04-18',
    },
    {
      id: 3,
      title: 'Mind Secrets',
      thumbnail: '/images/movie3.jpg',
      episodes: 6,
      views: 1254,
      likes: 214,
      aiGenerated: false,
      date: '2024-04-15',
    },
  ],
  recentStories: [
    {
      id: 1,
      title: 'Whispers in the Wind',
      thumbnail: '/images/story1.jpg',
      chapters: 24,
      views: 3421,
      likes: 876,
      aiGenerated: true,
      date: '2024-04-19',
    },
    {
      id: 2,
      title: 'Forgotten Realms',
      thumbnail: '/images/story2.jpg',
      chapters: 18,
      views: 2187,
      likes: 543,
      aiGenerated: true,
      date: '2024-04-17',
    },
    {
      id: 3,
      title: 'The Silent Guardian',
      thumbnail: '/images/story3.jpg',
      chapters: 12,
      views: 1654,
      likes: 329,
      aiGenerated: false,
      date: '2024-04-12',
    },
  ],
  recentUsers: [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: '/avatars/user1.jpg',
      joinDate: '2024-04-15',
      lastActive: '3 hours ago',
      contentViewed: 32,
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      avatar: '/avatars/user2.jpg',
      joinDate: '2024-04-12',
      lastActive: '1 day ago',
      contentViewed: 28,
    },
    {
      id: 3,
      name: 'Jessica Barnes',
      email: 'jess.b@example.com',
      avatar: '/avatars/user3.jpg',
      joinDate: '2024-04-10',
      lastActive: '5 hours ago',
      contentViewed: 45,
    },
  ],
  apiUsage: {
    limit: 10000,
    used: 5432,
    errorRate: 2.3,
    lastUpdated: '5 minutes ago',
    trend: '+12% from yesterday',
  },
  popularSearches: [
    { term: 'sci-fi movies', count: 756 },
    { term: 'romance novel', count: 542 },
    { term: 'action thriller', count: 498 },
    { term: 'fantasy stories', count: 387 },
    { term: 'detective mystery', count: 354 },
  ],
};

// This would come from your API
const getDashboardData = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 500);
  });
};

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
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center pt-1 text-xs">
          <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
          <span className={trendColor}>+12.5%</span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
        {href && (
          <div className="pt-3">
            <Link href={href}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                View details <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load dashboard</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-4 w-4" />}
          title="Total Visits"
          value={data.stats.totalVisits}
          trend="up"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          title="Total Users"
          value={data.stats.totalUsers}
          trend="up"
          href="/users"
        />
        <StatCard
          icon={<Film className="h-4 w-4" />}
          title="Movies"
          value={data.stats.totalMovies}
          trend="up"
          href="/movies"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          title="Stories"
          value={data.stats.totalStories}
          trend="up"
          href="/stories"
        />
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* AI Generated Content Card */}
            <Card>
              <CardHeader>
                <CardTitle>AI Generated Content</CardTitle>
                <CardDescription>Total content generated using Gemini API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.stats.aiContentGenerated}</p>
                      <p className="text-xs text-muted-foreground">Movies, stories and summaries</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-green-500">+8% this week</Badge>
                    <Link href="/ai-content">
                      <Button variant="link" size="sm" className="h-auto p-0">
                        View all AI content
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle>Gemini API Usage</CardTitle>
                <CardDescription>
                  Daily API calls: {data.stats.dailyApiCalls} / {data.apiUsage.limit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <Progress
                    value={(data.apiUsage.used / data.apiUsage.limit) * 100}
                    className="h-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {data.apiUsage.used} calls used (
                    {Math.round((data.apiUsage.used / data.apiUsage.limit) * 100)}%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {data.apiUsage.lastUpdated}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm">
                      Error Rate: <span className="font-medium">{data.apiUsage.errorRate}%</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{data.apiUsage.trend}</p>
                  </div>
                  <Link href="/api-stats">
                    <Button variant="secondary" size="sm">
                      View API Stats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Searches Card */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Searches</CardTitle>
              <CardDescription>What users are looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popularSearches.map((search: any, i: any) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {i + 1}
                      </div>
                      <p className="font-medium">{search.term}</p>
                    </div>
                    <p className="text-muted-foreground">{search.count} searches</p>
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
                  <CardTitle>Recent Movies</CardTitle>
                  <Link href="/movies">
                    <Button variant="ghost" size="sm">
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-right">Episodes</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentMovies.map((movie: any) => (
                      <TableRow key={movie.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 overflow-hidden rounded">
                              <div className="absolute inset-0 bg-muted" />
                              {/* In a real app, use next/image with proper src */}
                              <div className="h-full w-full bg-muted" />
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
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{movie.episodes}</TableCell>
                        <TableCell className="text-right">{movie.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Stories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Stories</CardTitle>
                  <Link href="/stories">
                    <Button variant="ghost" size="sm">
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-right">Chapters</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentStories.map((story: any) => (
                      <TableRow key={story.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 overflow-hidden rounded">
                              <div className="absolute inset-0 bg-muted" />
                              {/* In a real app, use next/image with proper src */}
                              <div className="h-full w-full bg-muted" />
                            </div>
                            <div>
                              <div className="font-medium">{story.title}</div>
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(story.date).toLocaleDateString()}
                                </p>
                                {story.aiGenerated && (
                                  <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{story.chapters}</TableCell>
                        <TableCell className="text-right">{story.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
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
                <h3 className="text-xl font-medium mb-1">Create New Content</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use Gemini AI to generate movie episodes or story chapters
                </p>
                <div className="flex gap-3">
                  <Link href="/movies/new">
                    <Button>
                      <Film className="mr-2 h-4 w-4" />
                      New Movie
                    </Button>
                  </Link>
                  <Link href="/stories/new">
                    <Button variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      New Story
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
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Users who have recently joined or been active</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Content Viewed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
                          <span>{user.lastActive}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.contentViewed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Link href="/users">
                  <Button>View All Users</Button>
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
                <CardTitle className="text-sm font-medium">Daily API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.stats.dailyApiCalls.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((data.apiUsage.used / data.apiUsage.limit) * 100)}% of daily limit
                </p>
                <Progress
                  value={(data.apiUsage.used / data.apiUsage.limit) * 100}
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.apiUsage.errorRate}%</div>
                <p className="text-xs text-muted-foreground">+0.5% from yesterday</p>
                <Progress value={data.apiUsage.errorRate * 5} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {data.apiUsage.lastUpdated}
                </p>
                <div className="mt-4">
                  <Link href="/api-stats">
                    <Button variant="outline" size="sm" className="w-full">
                      View detailed stats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Usage Chart</CardTitle>
              <CardDescription>API calls over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {/* In a real app, render a chart component here */}
              <div className="h-80 w-full rounded-md bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">API usage chart would render here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
