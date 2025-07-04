'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, CheckCircle2, Eye, Heart, Scroll, XCircle } from 'lucide-react';

interface StoryStatsProps {
  stats: {
    total: number;
    published: number;
    drafts: number;
    aiGenerated: number;
    totalViews: number;
    totalLikes: number;
    averageRating: number;
  };
}

export default function StoryStats({ stats }: StoryStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng số truyện</CardTitle>
          <Scroll className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.aiGenerated} được tạo bằng AI (
            {Math.round((stats.aiGenerated / stats.total) * 100) || 0}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.published}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.published / stats.total) * 100) || 0}% tổng số
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.drafts}</div>
          <p className="text-xs text-muted-foreground">Chưa được xuất bản</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalLikes.toLocaleString()} lượt thích
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
