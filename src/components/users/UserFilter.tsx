// File: components/users/UserFilters.tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import { Filter, X, CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserRole } from "@/interface/user.interface";
import { AppDispatch, RootState } from "@/app/redux/store";
import { setSearch, setRole, setStatus, setDateRange, setLastActive, resetFilters, clearSearch, clearRole, clearStatus, clearLastActive } from "@/app/redux/userFilters/userFiltersSlice";

interface UserFiltersProps {
  className?: string;
}

export default function UserFilters({ className }: UserFiltersProps) {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.userFilters);

  // Count the number of active filters
  const activeFilterCount = (() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.lastActive !== "all") count++;
    return count;
  })();

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value));
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "PP");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bộ lọc dropdown */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Lọc người dùng</h4>

              <div className="space-y-2">
                <Label htmlFor="filter-search">Tìm kiếm</Label>
                <Input
                  id="filter-search"
                  placeholder="Tìm theo tên hoặc email"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="roles">
                  <AccordionTrigger>Vai trò</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.role}
                      onValueChange={(value) =>
                        dispatch(setRole(value as UserRole | "all"))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Quản trị viên</SelectItem>
                        <SelectItem value={UserRole.MODERATOR}>Điều phối viên</SelectItem>
                        <SelectItem value={UserRole.USER}>Người dùng</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="status">
                  <AccordionTrigger>Trạng thái</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        dispatch(setStatus(value as "active" | "inactive" | "all"))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="date-range">
                  <AccordionTrigger>Ngày đăng ký</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="space-y-2">
                      <Label>Từ ngày</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? (
                              format(filters.dateFrom, "PPP")
                            ) : (
                              "Chọn ngày"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={(date) =>
                              dispatch(setDateRange({
                                from: date,
                                to: filters.dateTo
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Đến ngày</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? (
                              format(filters.dateTo, "PPP")
                            ) : (
                              "Chọn ngày"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={(date) =>
                              dispatch(setDateRange({
                                from: filters.dateFrom,
                                to: date
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="last-active">
                  <AccordionTrigger>Hoạt động gần nhất</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.lastActive}
                      onValueChange={(value) =>
                        dispatch(setLastActive(value as any))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khoảng thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Bất kỳ lúc nào</SelectItem>
                        <SelectItem value="today">Hôm nay</SelectItem>
                        <SelectItem value="thisWeek">Tuần này</SelectItem>
                        <SelectItem value="thisMonth">Tháng này</SelectItem>
                        <SelectItem value="never">Chưa từng</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(resetFilters())}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Đặt lại tất cả
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Hiển thị các bộ lọc đang hoạt động */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Tìm: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(clearSearch())}
                />
              </Badge>
            )}

            {filters.role && filters.role !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Vai trò: {filters.role}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(clearRole())}
                />
              </Badge>
            )}

            {filters.status && filters.status !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Trạng thái: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(clearStatus())}
                />
              </Badge>
            )}

            {filters.dateFrom && (
              <Badge variant="secondary" className="gap-1">
                Từ: {formatDate(filters.dateFrom)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(setDateRange({
                    from: undefined,
                    to: filters.dateTo
                  }))}
                />
              </Badge>
            )}

            {filters.dateTo && (
              <Badge variant="secondary" className="gap-1">
                Đến: {formatDate(filters.dateTo)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(setDateRange({
                    from: filters.dateFrom,
                    to: undefined
                  }))}
                />
              </Badge>
            )}

            {filters.lastActive && filters.lastActive !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Hoạt động gần nhất: {filters.lastActive}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => dispatch(clearLastActive())}
                />
              </Badge>
            )}

            {activeFilterCount > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(resetFilters())}
                className="h-7 px-2 text-xs"
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}