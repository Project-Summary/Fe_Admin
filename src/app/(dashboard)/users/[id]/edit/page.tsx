// File: app/(dashboard)/users/[id]/edit/page.tsx
'use client';

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserForm } from "@/components/users";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/app/redux/store";
import { clearSelectedUser } from "@/app/redux/users/slice.users";
import { findOneUserThunk, updateUserThunk } from "@/app/redux/users/thunk.users";
import { UpdateUserDto } from "@/interface/user.interface";

const UsersEditPage = () => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { selectedUser, loading, error } = useSelector((state: RootState) => state.users);
    const userId = params.id as string;

    // Fetch user data on mount
    useEffect(() => {
        if (userId) {
            dispatch(findOneUserThunk(userId));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [dispatch, userId]);

    const handleUpdateUser = async (userData: UpdateUserDto) => {
        try {
            await dispatch(updateUserThunk({
                id: userId,
                data: userData,
                onSuccess: () => {
                    toast.success("Người dùng đã cập nhật thành công!");
                    router.push("/users");
                }
            })).unwrap();
        } catch (error) {
            console.error("Error updating user:", error);
            // Error toast is already handled in the thunk
        }
    };

    const handleCancel = () => {
        router.push("/users");
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

    // User not found
    if (!selectedUser && !loading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Không tìm thấy người dùng</h3>
                            <p className="text-muted-foreground">
                                Người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                            </p>
                        </div>
                        <Button onClick={() => router.push("/users")}>
                            Quay lại Người dùng
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
                    <p className="text-muted-foreground">
                        Cập nhật thông tin cho {selectedUser?.name || 'người dùng này'}.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <UserForm
                    user={selectedUser}
                    onSubmit={handleUpdateUser}
                    onCancel={handleCancel}
                    isLoading={loading}
                />
            </div>
        </div>
    );
};

export default UsersEditPage;