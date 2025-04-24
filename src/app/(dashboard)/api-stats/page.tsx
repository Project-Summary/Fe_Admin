'use client';

import { useState, useEffect } from 'react';
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

// Mock data for the API usage
const mockApiData = {
  dailyUsage: {
    limit: 10000,
    used: 5432,
    remaining: 4568,
    resetTime: '24:00:00 UTC',
  },
  status: {
    online: true,
    latency: 213, // ms
    lastIncident: '2 weeks ago',
    uptime: '99.8%',
  },
  usageByDay: [
    { name: 'Mon', requests: 3250, tokens: 157000, errors: 32 },
    { name: 'Tue', requests: 4200, tokens: 185000, errors: 27 },
    { name: 'Wed', requests: 2800, tokens: 142000, errors: 18 },
    { name: 'Thu', requests: 3500, tokens: 167000, errors: 24 },
    { name: 'Fri', requests: 5432, tokens: 210000, errors: 41 },
    { name: 'Sat', requests: 2100, tokens: 98000, errors: 13 },
    { name: 'Sun', requests: 1800, tokens: 82000, errors: 9 },
  ],
  usageByModel: [
    { name: 'Gemini Pro', requests: 15082, percentage: 65 },
    { name: 'Gemini Flash', requests: 5340, percentage: 23 },
    { name: 'Embedding', requests: 2760, percentage: 12 },
  ],
  usageByFeature: [
    { name: 'Movies', value: 11200 },
    { name: 'Stories', value: 8500 },
    { name: 'Summaries', value: 3100 },
    { name: 'Other', value: 1300 },
  ],
  errorsOverTime: [
    { name: 'Week 1', rate: 2.1 },
    { name: 'Week 2', rate: 1.8 },
    { name: 'Week 3', rate: 2.3 },
    { name: 'Week 4', rate: 1.9 },
    { name: 'Week 5', rate: 2.4 },
    { name: 'Week 6', rate: 2.0 },
  ],
  recentRequests: [
    {
      id: 'req_123456',
      timestamp: '14:32:10',
      feature: 'Movies',
      model: 'Gemini Pro',
      status: 'success',
      tokens: 3245,
      latency: 420, // ms
    },
    {
      id: 'req_123455',
      timestamp: '14:30:45',
      feature: 'Stories',
      model: 'Gemini Pro',
      status: 'success',
      tokens: 2876,
      latency: 385, // ms
    },
    {
      id: 'req_123454',
      timestamp: '14:28:22',
      feature: 'Movies',
      model: 'Gemini Flash',
      status: 'error',
      tokens: 0,
      latency: 540, // ms
      error: 'Rate limit exceeded',
    },
    {
      id: 'req_123453',
      timestamp: '14:25:10',
      feature: 'Summaries',
      model: 'Gemini Pro',
      status: 'success',
      tokens: 1243,
      latency: 310, // ms
    },
    {
      id: 'req_123452',
      timestamp: '14:22:51',
      feature: 'Stories',
      model: 'Gemini Pro',
      status: 'success',
      tokens: 4532,
      latency: 620, // ms
    },
  ],
  costAnalysis: {
    currentMonth: 287.45,
    previousMonth: 248.32,
    forecast: 312.2,
    breakdown: [
      { name: 'Gemini Pro', cost: 187.3 },
      { name: 'Gemini Flash', cost: 62.15 },
      { name: 'Embedding', cost: 38.0 },
    ],
  },
};

export default function ApiStatsPage() {
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch API data on mount
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setApiData(mockApiData);
      } catch (error) {
        console.error('Failed to fetch API stats:', error);
        toast.error('Failed to load API statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, []);

  // Handle refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setApiData({
        ...mockApiData,
        dailyUsage: {
          ...mockApiData.dailyUsage,
          used: mockApiData.dailyUsage.used + 47,
          remaining: mockApiData.dailyUsage.remaining - 47,
        },
      });
      toast.success('API statistics refreshed');
    } catch (error) {
      console.error('Failed to refresh API stats:', error);
      toast.error('Failed to refresh API statistics');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate error rate
  const calculateErrorRate = () => {
    if (!apiData) return 0;

    const totalRequests = apiData.usageByDay.reduce((acc, day) => acc + day.requests, 0);
    const totalErrors = apiData.usageByDay.reduce((acc, day) => acc + day.errors, 0);

    return ((totalErrors / totalRequests) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-transparent" />
          <p className="text-sm text-muted-foreground">Loading API statistics...</p>
        </div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load API statistics</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gemini API Stats</h1>
          <p className="text-muted-foreground">Monitor and analyze your Gemini API usage</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* API Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Daily API Usage</CardTitle>
              <CardDescription>Resets at {apiData.dailyUsage.resetTime}</CardDescription>
            </div>
            <div
              className={`rounded-full bg-${apiData.status.online ? 'green' : 'red'}-500/20 p-1`}
            >
              <div
                className={`h-2 w-2 rounded-full bg-${apiData.status.online ? 'green' : 'red'}-500`}
              ></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {apiData.dailyUsage.used.toLocaleString()} /{' '}
                  {apiData.dailyUsage.limit.toLocaleString()} requests
                </span>
                <span className="text-muted-foreground">
                  {Math.round((apiData.dailyUsage.used / apiData.dailyUsage.limit) * 100)}% used
                </span>
              </div>
              <Progress
                value={(apiData.dailyUsage.used / apiData.dailyUsage.limit) * 100}
                className="h-2"
              />
              <div className="pt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>{apiData.dailyUsage.remaining.toLocaleString()} requests remaining</span>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Increase limit <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <div
                  className={`inline-flex rounded-md bg-${apiData.status.online ? 'green' : 'red'}-500/20 p-2`}
                >
                  <Activity
                    className={`h-5 w-5 text-${apiData.status.online ? 'green' : 'red'}-500`}
                  />
                </div>
                <h3 className="mt-2 font-medium">
                  {apiData.status.online ? 'Operational' : 'Outage Detected'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {apiData.status.uptime} uptime this month
                </p>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium">{apiData.status.latency} ms</p>
                <p className="text-xs text-muted-foreground">Average latency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <div className="inline-flex rounded-md bg-amber-500/20 p-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="mt-2 text-2xl font-medium">{calculateErrorRate()}%</h3>
                <p className="text-xs text-muted-foreground">Overall error rate</p>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium">
                  {apiData.usageByDay.reduce((acc, day) => acc + day.errors, 0)} errors
                </p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Usage Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Usage by Day Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>API Requests Over Time</CardTitle>
                <CardDescription>Number of requests and tokens used per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={apiData.usageByDay}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="requests"
                        name="Requests"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="tokens"
                        name="Tokens"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Usage by Model */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
                <CardDescription>Breakdown of API requests by model type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={apiData.usageByModel}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} requests`} />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  {apiData.usageByModel.map((model) => (
                    <div key={model.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span>{model.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{model.requests.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">({model.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage by Feature */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription>Distribution of API requests across features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={apiData.usageByFeature}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 50, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} requests`} />
                      <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Requests</CardTitle>
              <CardDescription>The most recent API calls made to Gemini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted px-4 py-2 text-xs font-medium">
                  <div>Time</div>
                  <div>Request ID</div>
                  <div>Feature</div>
                  <div>Model</div>
                  <div>Status</div>
                  <div>Tokens</div>
                  <div>Latency</div>
                </div>
                <div className="divide-y">
                  {apiData.recentRequests.map((request) => (
                    <div key={request.id} className="grid grid-cols-7 px-4 py-3 text-sm">
                      <div className="text-muted-foreground">{request.timestamp}</div>
                      <div className="font-mono text-xs">{request.id}</div>
                      <div>{request.feature}</div>
                      <div>{request.model}</div>
                      <div>
                        {request.status === 'success' ? (
                          <Badge className="bg-green-500">{request.status}</Badge>
                        ) : (
                          <Badge variant="destructive">{request.status}</Badge>
                        )}
                      </div>
                      <div>{request.tokens > 0 ? request.tokens.toLocaleString() : '-'}</div>
                      <div className="text-muted-foreground">{request.latency} ms</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline">View All Requests</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>Latency of API responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: '<100ms', value: 12 },
                        { name: '100-200ms', value: 25 },
                        { name: '200-300ms', value: 35 },
                        { name: '300-500ms', value: 18 },
                        { name: '500ms+', value: 10 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}% of requests`} />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Volume by Hour</CardTitle>
                <CardDescription>Number of requests throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { hour: '00:00', requests: 120 },
                        { hour: '03:00', requests: 80 },
                        { hour: '06:00', requests: 150 },
                        { hour: '09:00', requests: 420 },
                        { hour: '12:00', requests: 580 },
                        { hour: '15:00', requests: 610 },
                        { hour: '18:00', requests: 490 },
                        { hour: '21:00', requests: 280 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} requests`} />
                      <Bar dataKey="requests" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Error Rate Over Time</CardTitle>
                <CardDescription>Weekly error rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={apiData.errorsOverTime}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Error Types</CardTitle>
                <CardDescription>Breakdown of error categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rate limits exceeded</span>
                      <span className="text-muted-foreground">38%</span>
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Token limit exceeded</span>
                      <span className="text-muted-foreground">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Content filtering</span>
                      <span className="text-muted-foreground">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Server errors</span>
                      <span className="text-muted-foreground">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Other</span>
                      <span className="text-muted-foreground">7%</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Log</CardTitle>
                <CardDescription>Recent API error messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiData.recentRequests
                    .filter((req) => req.status === 'error')
                    .map((error) => (
                      <div key={error.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">Error</Badge>
                          <span className="text-xs text-muted-foreground">{error.timestamp}</span>
                        </div>
                        <p className="mt-2 font-mono text-xs">{error.id}</p>
                        <p className="mt-1 text-sm font-medium">{error.error}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {error.feature} / {error.model}
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <Info className="h-3 w-3" />
                            <span className="text-xs">Details</span>
                          </Button>
                        </div>
                      </div>
                    ))}

                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">Error</Badge>
                      <span className="text-xs text-muted-foreground">14:15:33</span>
                    </div>
                    <p className="mt-2 font-mono text-xs">req_123450</p>
                    <p className="mt-1 text-sm font-medium">Invalid request format</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Stories / Gemini Pro</span>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Info className="h-3 w-3" />
                        <span className="text-xs">Details</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Tab */}
        <TabsContent value="cost" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Current Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">${apiData.costAnalysis.currentMonth}</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <ArrowUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">
                      {(
                        ((apiData.costAnalysis.currentMonth - apiData.costAnalysis.previousMonth) /
                          apiData.costAnalysis.previousMonth) *
                        100
                      ).toFixed(1)}
                      % from last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Monthly Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">${apiData.costAnalysis.forecast}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Projected by end of month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">$187.80</p>
                  <p className="mt-2 text-sm text-muted-foreground">Remaining from $500 budget</p>
                  <Progress value={62.44} className="mt-4 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">62.4% of budget used</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>API usage cost by model type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={apiData.costAnalysis.breakdown}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Bar dataKey="cost" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 rounded-md border">
                <div className="grid grid-cols-3 bg-muted px-4 py-2 text-xs font-medium">
                  <div>Model</div>
                  <div>Cost</div>
                  <div>% of Total</div>
                </div>
                <div className="divide-y">
                  {apiData.costAnalysis.breakdown.map((item) => (
                    <div key={item.name} className="grid grid-cols-3 px-4 py-3 text-sm">
                      <div>{item.name}</div>
                      <div>${item.cost}</div>
                      <div>
                        {((item.cost / apiData.costAnalysis.currentMonth) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Feedback Analysis</CardTitle>
                <CardDescription>User feedback on Gemini generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  <div className="flex w-full justify-center gap-12">
                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                        <ThumbsUp className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="mt-2 text-xl font-bold">83%</p>
                      <p className="text-sm text-muted-foreground">Positive</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                        <ThumbsDown className="h-8 w-8 text-red-500" />
                      </div>
                      <p className="mt-2 text-xl font-bold">17%</p>
                      <p className="text-sm text-muted-foreground">Negative</p>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Movies</span>
                          <span className="text-muted-foreground">88% positive</span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="bg-green-500" style={{ width: '88%' }} />
                          <div className="bg-red-500" style={{ width: '12%' }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stories</span>
                          <span className="text-muted-foreground">84% positive</span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="bg-green-500" style={{ width: '84%' }} />
                          <div className="bg-red-500" style={{ width: '16%' }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Summaries</span>
                          <span className="text-muted-foreground">76% positive</span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="bg-green-500" style={{ width: '76%' }} />
                          <div className="bg-red-500" style={{ width: '24%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>Recommendations to reduce API costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-500/20 p-1">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-medium">Use Caching for Common Requests</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Implement caching to reduce duplicate API calls for common requests. Potential
                      savings: ~15%
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-500/20 p-1">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-medium">Optimize Prompts</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Review and refine your prompts to be more concise, reducing token usage.
                      Potential savings: ~8%
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-500/20 p-1">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-medium">Batch Processing</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Combine multiple requests into batches where possible. Potential savings: ~10%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
