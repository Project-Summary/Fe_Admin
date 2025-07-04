// File: components/users/UserList.tsx
"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash,
  UserX,
  UserCheck,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserRole } from "@/interface/user.interface";
import { useUserFilters } from "@/hooks/useUserFilters";

interface UserListProps {
  users: User[];
  onEdit: (userId: string) => void;
  onView: (userId: string) => void;
  onDelete: (userId: string) => void;
  onStatusChange: (userId: string, isActive: boolean) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  onUserSelect: (userId: string, selected: boolean) => void;
  selectedUsers: string[];
  loading?: boolean;
}

export default function UserList({
  users,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onRoleChange,
  onUserSelect,
  selectedUsers,
  loading = false
}: UserListProps) {
  const router = useRouter();
  const { filters, actions } = useUserFilters();

  const handleSelectAll = (checked: boolean) => {
    onUserSelect("all", checked);
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === 'asc'
        ? 'desc'
        : 'asc';

    actions.setSorting({ sortBy, sortOrder: newSortOrder });
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return filters.sortOrder === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.MODERATOR:
        return "default";
      default:
        return "secondary";
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Không bao giờ";
    return format(new Date(date), "PPP");
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "Không bao giờ";
    return format(new Date(date), "PPP p");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-4">Đang tải người dùng...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {users.length === 0 ? "Không tìm thấy người dùng" : `${users.length} users`}
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('name')}
                  >
                    Người dùng
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead> Vai trò</TableHead>
                <TableHead> Trạng thái</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    Lần đăng nhập cuối
                    {getSortIcon('lastLoginAt')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('createdAt')}
                  >
                    Thành viên từ
                    {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow
                    key={user._id}
                    className={selectedUsers.includes(user._id) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={(checked) =>
                          onUserSelect(user._id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(user.lastLoginAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Hành động</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(user._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa người dùng
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onStatusChange(user._id, !user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Hủy kích hoạt
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Kích hoạt
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user._id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <UserPlus className="h-8 w-8 text-muted-foreground" />
                      <div className="text-lg font-medium">Không tìm thấy người dùng nào</div>
                      <div className="text-sm text-muted-foreground">
                        Hãy thử điều chỉnh bộ lọc của bạn hoặc thêm người dùng mới
                      </div>
                      <Button
                        className="mt-2"
                        onClick={() => router.push("/users/new")}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Thêm người dùng đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tóm tắt lựa chọn */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {selectedUsers.length} đã chọn
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUserSelect("all", false)}
          >
            Xóa lựa chọn
          </Button>
        </div>
      )}
    </div>
  );
}