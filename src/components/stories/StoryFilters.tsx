'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface StoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  totalResults: number;
  totalItems: number;
}

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

const categoryOptions = [
  { value: 'all', label: 'Tất cả thể loại' },
  { value: 'action', label: 'Hành động' },
  { value: 'adventure', label: 'Phiêu lưu' },
  { value: 'comedy', label: 'Hài hước' },
  { value: 'drama', label: 'Chính kịch' },
  { value: 'fantasy', label: 'Giả tưởng' },
  { value: 'horror', label: 'Kinh dị' },
  { value: 'mystery', label: 'Bí ẩn' },
  { value: 'romance', label: 'Lãng mạn' },
  { value: 'sci-fi', label: 'Khoa học viễn tưởng' },
  { value: 'thriller', label: 'Giật gân' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'views-high', label: 'Lượt xem nhiều nhất' },
  { value: 'views-low', label: 'Lượt xem ít nhất' },
  { value: 'likes-high', label: 'Yêu thích nhiều nhất' },
  { value: 'likes-low', label: 'Yêu thích ít nhất' },
  { value: 'title-asc', label: 'Tiêu đề (A-Z)' },
  { value: 'title-desc', label: 'Tiêu đề (Z-A)' },
  { value: 'rating-high', label: 'Đánh giá cao nhất' },
  { value: 'rating-low', label: 'Đánh giá thấp nhất' },
];

export default function StoryFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  onResetFilters,
  totalResults,
  totalItems,
}: StoryFiltersProps) {
  const activeFiltersCount = [
    searchQuery && 'search',
    statusFilter !== 'all' && 'status',
    categoryFilter !== 'all' && 'category',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Dòng lọc chính */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm truyện..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bộ lọc mở rộng */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo thể loại" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Hiển thị:</span>
            <span className="text-sm font-medium">
              {totalResults} trên {totalItems}
            </span>
          </div>

          <Button variant="ghost" onClick={onResetFilters}>
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
