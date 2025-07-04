'use client';

import { Story } from '@/app/redux/story/interface.story';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  CheckCircle2,
  Eye,
  Heart,
  Loader2,
  MoreHorizontal,
  Pencil,
  Star,
  Trash,
  XCircle,
} from 'lucide-react';

interface StoryCardProps {
  story: Story;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onViewSummary: (id: string) => void;
  isUpdatingStatus?: boolean;
}

export default function StoryCard({
  story,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  onViewSummary,
  isUpdatingStatus = false,
}: StoryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Checkbox */}
          <div className="flex items-center p-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(story._id)}
            />
          </div>

          {/* Ảnh truyện */}
          <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-muted">
            {story.poster ? (
              <img
                src={story.poster}
                alt={story.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Thông tin truyện */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{story.title}</h3>
                  {story.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {story.description}
                    </p>
                  )}
                </div>

                {/* Menu hành động */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewSummary(story._id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem tóm tắt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(story._id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {story.status === 'draft' ? (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(story._id, 'published')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Xuất bản
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(story._id, 'draft')}
                        disabled={isUpdatingStatus}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Gỡ xuống
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(story._id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Thẻ và phân loại */}
              <div className="mt-2 flex flex-wrap gap-1">
                {story.isAIGenerated && (
                  <Badge variant="outline" className="h-5 text-xs bg-primary/10">
                    <Bot className="mr-1 h-3 w-3" />
                    AI
                  </Badge>
                )}
                {story.categories.slice(0, 2).map((category) => (
                  <Badge key={category._id} variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                ))}
                {story.categories.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{story.categories.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Thông tin phụ */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{story.statistics.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{story.statistics.likes.toLocaleString()}</span>
                </div>
                {story.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{story.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={story.status === 'published' ? 'default' : 'outline'}
                  className={story.status === 'published' ? 'bg-green-500' : ''}
                >
                  {story.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </Badge>
                {isUpdatingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
            </div>

            {/* Ngày tạo */}
            <div className="mt-1 text-xs text-muted-foreground">
              Ngày tạo: {new Date(story.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
