// File: app/(dashboard)/users/new/page.tsx
'use client';

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/app/redux/store";
import { createUserThunk } from "@/app/redux/users/thunk.users";
import { AdminUpdateUserDto, CreateUserDto } from "@/interface/user.interface";

const UsersNewPage = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.users);

    const handleCreateUser = async (userData: CreateUserDto) => {
        try {
            await dispatch(createUserThunk({
                data: userData,
                onSuccess: () => {
                    toast.success("Người dùng đã được tạo thành công!");
                    router.push("/users");
                }
            })).unwrap();
        } catch (error) {
            console.error("Error creating user:", error);
            // Error toast is already handled in the thunk
        }
    };

    const handleCancel = () => {
        router.push("/users");
    };

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
                    <h1 className="text-3xl font-bold">Tạo người dùng mới</h1>
                    <p className="text-muted-foreground">
                        Thêm người dùng mới vào hệ thống với các vai trò và tùy chọn.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={handleCancel}
                    isLoading={loading}
                />
            </div>
        </div>
    );
};

export default UsersNewPage;