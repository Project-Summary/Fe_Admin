// File: components/users/UserForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserRole, User, AdminUpdateUserDto, CreateUserDto } from "@/interface/user.interface";
// Schema xác thực cho form tạo người dùng mới
const createUserSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa, một chữ cái thường và một chữ số."
    }),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Vui lòng chọn vai trò hợp lệ." }),
  }),
  isActive: z.boolean().default(true),
  avatar: z.string().optional(),
  // Tùy chọn
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),
});

// Schema xác thực cho form cập nhật người dùng
const updateUserSchema = createUserSchema.extend({
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa, một chữ cái thường và một chữ số."
    })
    .optional()
    .or(z.literal("")),
}).partial();

// Updated interfaces to match backend
export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
  };
}

export interface UpdateUserFormData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    newsletter?: boolean;
  };
}

// Props for the UserForm component
interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading = false
}: UserFormProps) {
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNewUser = !user;

  // Choose the appropriate schema based on whether we're creating or updating
  const formSchema = isNewUser ? createUserSchema : updateUserSchema;

  // Set up the form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || UserRole.USER,
      isActive: user?.isActive ?? true,
      avatar: user?.avatar || "",
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      pushNotifications: user?.preferences?.pushNotifications ?? true,
      newsletter: user?.preferences?.newsletter ?? false,
    },
  });

  // Xử lý khi người dùng chọn file ảnh đại diện
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn một tệp hình ảnh.");
        return;
      }

      // Kiểm tra dung lượng file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh phải nhỏ hơn 5MB.");
        return;
      }

      setAvatarFile(file);

      // Tạo URL xem trước ảnh
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      let avatarUrl = avatar;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        // In a real app, you'd upload to your image service here
        // For now, we'll use the base64 data URL
        avatarUrl = avatar;
      }

      const userData = {
        ...data,
        // Include avatar URL if it exists
        ...(avatarUrl && { avatar: avatarUrl }),
        // Structure preferences properly
        preferences: {
          emailNotifications: data.emailNotifications ?? true,
          pushNotifications: data.pushNotifications ?? true,
          newsletter: data.newsletter ?? false,
        },
      };

      // Remove preferences fields from the top level
      delete (userData as any).emailNotifications;
      delete (userData as any).pushNotifications;
      delete (userData as any).newsletter;

      // If password is empty and we're updating, remove it
      if (!isNewUser && !userData.password) {
        delete userData.password;
      }

      onSubmit(userData as CreateUserDto | AdminUpdateUserDto);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Không thể gửi biểu mẫu");
    }
  };

  // Generate avatar fallback from name
  const getNameInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isNewUser ? "Tạo người dùng mới" : "Chỉnh sửa người dùng"}</CardTitle>
            <CardDescription>
              {isNewUser
                ? "Thêm người dùng mới vào hệ thống với các vai trò và quyền phù hợp."
                : "Cập nhật thông tin, vai trò và tùy chọn của người dùng."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || user?.avatar} />
                    <AvatarFallback className="text-lg font-semibold">
                      {form.watch("name")
                        ? getNameInitials(form.watch("name") as string)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {avatar && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên Avatar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Tối đa 5MB • JPG, PNG, GIF
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Nhập địa chỉ email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Địa chỉ này sẽ được sử dụng để đăng nhập và thông báo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isNewUser ? "Password" : "Mật khẩu mới"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={
                            isNewUser
                              ? "Tạo mật khẩu mạnh"
                              : "Để trống để giữ mật khẩu hiện tại"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isNewUser ? (
                          "Phải chứa chữ hoa, chữ thường và số."
                        ) : (
                          "Để trống để giữ mật khẩu hiện tại."
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="role" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="role">Vai trò & Trạng thái</TabsTrigger>
                <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
              </TabsList>

              <TabsContent value="role" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò người dùng</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò người dùng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.USER}>
                            Người dùng - Quyền truy cập và quyền cơ bản
                          </SelectItem>
                          <SelectItem value={UserRole.MODERATOR}>
                            Người điều hành - Quyền quản lý nội dung
                          </SelectItem>
                          <SelectItem value={UserRole.ADMIN}>
                            Quản trị viên - Quyền truy cập toàn bộ hệ thống
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Vai trò xác định quyền và tính năng nào mà người dùng có thể truy cập.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Trạng thái tài khoản
                        </FormLabel>
                        <FormDescription>
                          Người dùng không hoạt động không thể đăng nhập hoặc truy cập hệ thống.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tùy chọn thông báo</h4>
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Thông báo qua email
                          </FormLabel>
                          <FormDescription>
                            Nhận các bản cập nhật và thông báo quan trọng qua email.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Thông báo đẩy
                          </FormLabel>
                          <FormDescription>
                            Nhận thông báo theo thời gian thực trong trình duyệt của bạn.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Đăng ký nhận bản tin
                          </FormLabel>
                          <FormDescription>
                            Nhận bản tin của chúng tôi với các thông tin cập nhật, mẹo và chương trình khuyến mãi.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isNewUser ? "Đang tạo..." : "Đang lưu..."}
                </>
              ) : (
                isNewUser ? "Tạo người dùng" : "Lưu thay đổi"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}