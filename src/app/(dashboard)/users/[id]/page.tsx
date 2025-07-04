// File: app/(dashboard)/users/[id]/page.tsx
'use client';

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
    ArrowLeft,
    Edit,
    Trash,
    Mail,
    Shield,
    Clock,
    UserCheck,
    UserX,
    MoreHorizontal,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { UserRole } from "@/interface/user.interface";
import { AppDispatch, RootState } from "@/app/redux/store";
import { clearSelectedUser } from "@/app/redux/users/slice.users";
import { findOneUserThunk, getUserStatisticsThunk, deleteUserThunk, updateUserThunk } from "@/app/redux/users/thunk.users";

const UsersViewPage = () => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { selectedUser, statistics, loading, error } = useSelector((state: RootState) => state.users);
    const userId = params.id as string;

    // Fetch user data and statistics on mount
    useEffect(() => {
        if (userId) {
            dispatch(findOneUserThunk(userId));
            dispatch(getUserStatisticsThunk(userId));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [dispatch, userId]);

    const handleDeleteUser = async () => {
        try {
            await dispatch(deleteUserThunk(userId)).unwrap();
            toast.success("Đã xóa người dùng thành công!");
            router.push("/users");
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;

        try {
            await dispatch(updateUserThunk({
                id: userId,
                data: { isActive: !selectedUser.isActive },
                onSuccess: () => {
                    toast.success(`Người dùng ${!selectedUser.isActive ? 'đã kích hoạt' : 'đã hủy kích hoạt'} thành công!`);
                }
            })).unwrap();
        } catch (error) {
            console.error("Error updating user status:", error);
        }
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

    const getNameInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Loading state
    if (loading && !selectedUser) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex items-center justify-center p-12">
                        <div className="flex items-center gap-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Đang tải thông tin người dùng...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (error && !selectedUser) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-destructive">
                                Không tải được người dùng
                            </h3>
                            <p className="text-muted-foreground">
                                {error || "Không tìm thấy người dùng hoặc bạn không có quyền xem người dùng này."}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>
                                Quay lại
                            </Button>
                            <Button onClick={() => dispatch(findOneUserThunk(userId))}>
                                Thử lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!selectedUser) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
                        <p className="text-muted-foreground">
                            Xem và quản lý thông tin người dùng.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/users/${userId}/edit`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa Người dùng
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleToggleStatus}>
                                {selectedUser.isActive ? (
                                    <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Hủy kích hoạt Người dùng
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Kích hoạt Người dùng
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Xóa người dùng
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xóa người dùng</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn xóa {selectedUser.name} không? Không thể hoàn tác hành động này.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteUser}>
                                            Xóa
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hồ sơ</CardTitle>
                            <CardDescription>
                                Thông tin cơ bản về người dùng và thông tin tài khoản.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback className="text-lg">
                                        {getNameInitials(selectedUser.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        {selectedUser.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {selectedUser.role}
                                        </Badge>
                                        <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                                            {selectedUser.isActive ? "Hoạt động" : "Không hoạt động"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Thông tin tài khoản</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Thành viên từ:</span>
                                            <span>{format(new Date(selectedUser.createdAt), "PPP")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                                            <span>{format(new Date(selectedUser.updatedAt), "PPP")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Lần đăng nhập cuối:</span>
                                            <span>
                                                {selectedUser.lastLoginAt
                                                    ? format(new Date(selectedUser.lastLoginAt), "PPP")
                                                    : "Không bao giờ"
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Tùy chọn</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Thông báo qua email:</span>
                                            <Badge variant="outline">
                                                {selectedUser.preferences?.emailNotifications ? "Đã bật" : "Đã tắt"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Thông báo đẩy:</span>
                                            <Badge variant="outline">
                                                {selectedUser.preferences?.pushNotifications ? "Đã bật" : "Đã tắt"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bản tin:</span>
                                            <Badge variant="outline">
                                                {selectedUser.preferences?.newsletter ? "Đã đăng ký" : "Đã hủy đăng ký"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê hoạt động</CardTitle>
                            <CardDescription>
                                Số liệu hoạt động và tương tác của người dùng.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {statistics ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tổng số lượt xem:</span>
                                            <span className="font-medium">{statistics.totalViews}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tổng số lượt thích:</span>
                                            <span className="font-medium">{statistics.totalLikes}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tổng số bình luận:</span>
                                            <span className="font-medium">{statistics.totalComments}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Danh sách theo dõi Các mục:</span>
                                            <span className="font-medium">{statistics.watchlist?.length || 0}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Đang tải số liệu thống kê...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hành động nhanh */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push(`/users/${userId}/edit`)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa người dùng
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleToggleStatus}
                            >
                                {selectedUser.isActive ? (
                                    <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Hủy kích hoạt Người dùng
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Kích hoạt Người dùng
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UsersViewPage;