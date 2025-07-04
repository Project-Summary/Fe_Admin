// File: app/(dashboard)/users/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Plus, UserPlus, UserCog, Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserList,
  UserStats,
  UserFilters,
  BulkActions
} from "@/components/users";
import { toast } from "sonner";
import { User, UserRole } from "@/interface/user.interface";

import { useUserFilters } from "@/hooks/useUserFilters";
import { AppDispatch, RootState } from "@/app/redux/store";
import { getAllUsersThunk, deleteUserThunk, updateUserThunk } from "@/app/redux/users/thunk.users";

// Import Redux actions


export default function UsersPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { users, loading, error } = useSelector((state: RootState) => state.users);

  // Custom hook for filters
  const { filters, filterUsers, sortUsers, hasActiveFilters, actions } = useUserFilters();

  // Local state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Calculate stats from users data
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsers: 0,
        roleDistribution: {
          [UserRole.ADMIN]: 0,
          [UserRole.MODERATOR]: 0,
          [UserRole.USER]: 0,
        },
        lastRegisteredDate: new Date(),
      };
    }

    const totalUsers = users.length;
    console.log("Users: ", users);
    const activeUsers = users.filter((user: User) => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Count new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = users.filter((user: User) =>
      new Date(user.createdAt) > thirtyDaysAgo
    ).length;

    // Count roles
    const roleDistribution = {
      [UserRole.ADMIN]: users.filter((user: User) => user.role === UserRole.ADMIN).length,
      [UserRole.MODERATOR]: users.filter((user: User) => user.role === UserRole.MODERATOR).length,
      [UserRole.USER]: users.filter((user: User) => user.role === UserRole.USER).length,
    };

    // Find newest user
    const sortedUsers = [...users].sort((a: User, b: User) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastRegisteredDate = sortedUsers.length > 0
      ? new Date(sortedUsers[0].createdAt)
      : new Date();

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      roleDistribution,
      lastRegisteredDate,
    };
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const filtered = filterUsers(users);
    return sortUsers(filtered);
  }, [users, filterUsers, sortUsers]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedUsers([]);
  }, [filters]);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(getAllUsersThunk({limit: 50}));
  }, [dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle user actions
  const handleViewUser = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUserThunk(userId)).unwrap();
      toast.success("Đã xóa người dùng thành công");
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } catch (error) {
      toast.error("Không xóa được người dùng");
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      console.log("Actgive: ", isActive);
      const user = users.find((u: User) => u._id === userId);
      if (!user) return;

      await dispatch(updateUserThunk({
        id: userId,
        data: { isActive },
        onSuccess: () => {
          toast.success(`Người dùng ${isActive ? "activated" : "deactivated"} thành công`);
        }
      })).unwrap();
    } catch (error) {
      toast.error("Không cập nhật được trạng thái người dùng");
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await dispatch(updateUserThunk({
        id: userId,
        data: { role },
        onSuccess: () => {
          toast.success("Vai trò người dùng đã được cập nhật thành công");
        }
      })).unwrap();
    } catch (error) {
      toast.error("Không cập nhật được vai trò người dùng");
    }
  };

  // Handle bulk actions
  const handleUserSelect = (userId: string, selected: boolean) => {
    if (userId === "all") {
      if (selected) {
        setSelectedUsers(filteredUsers.map((user: User) => user._id));
      } else {
        setSelectedUsers([]);
      }
      return;
    }

    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Handle bulk actions moved to BulkActions component

  // Handle filters
  const clearAllFilters = () => {
    actions.resetFilters();
    setSelectedUsers([]);
  };

  // Handle refresh data
  const handleRefresh = () => {
    dispatch(getAllUsersThunk());
    setSelectedUsers([]);
  };

  // Handle export (placeholder)
  const handleExport = () => {
    // In a real app, this would generate and download a file
    const dataStr = JSON.stringify(filteredUsers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `users-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success("Người dùng đã xuất thành công");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Người dùng</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/users/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm người dùng đơn lẻ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/users/import")}>
                <Upload className="h-4 w-4 mr-2" />
                Nhập người dùng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UserCog className="h-4 w-4 mr-2" />
                Quản lý
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/users/roles")}>
                Quản lý vai trò
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/users/permissions")}>
                Quyền
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <UserStats stats={stats} />

      <UserFilters />

      {/* Results count display */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {filteredUsers.length} trong số {users?.length || 0} người dùng
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
          >
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-4">Đang tải người dùng...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <p className="text-red-500">Lỗi khi tải người dùng: {error}</p>
          <Button onClick={handleRefresh}>Thử lại</Button>
        </div>
      ) : (
        <UserList
          users={filteredUsers}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          onUserSelect={handleUserSelect}
          selectedUsers={selectedUsers}
          loading={loading}
        />
      )}

      {/* <BulkActions 
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedUsers([])}
        onSelectAll={() => setSelectedUsers(filteredUsers.map((user: User) => user._id))}
        disabled={loading}
      /> */}
    </div>
  );
}