"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { getCategoriesThunk, createCategoryThunk, updateCategoryThunk, deleteCategoryThunk } from "@/app/redux/categories/thunk.categories";
import { CategoryDto } from "@/interface/categories.interface";
import { TypeCategory } from "@/app/redux/categories/enum.categories";

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector((state: RootState) => state.categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryDto>({
    name: "",
    description: "",
    slug: "",
    isActive: true,
    movieCount: 0,
    storyCount: 0,
    type: TypeCategory.BOTH
  });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getCategoriesThunk());
  }, [dispatch]);

  const handleAdd = async () => {

    await dispatch(createCategoryThunk({
      data: newCategory,
      onSuccess: () => {
        setIsAddDialogOpen(false);
      }
    })).unwrap();
  };

  const handleEdit = (category: any) => {
    setEditingCategory({ ...category });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory._id) return;

    try {
      await dispatch(updateCategoryThunk({
        id: editingCategory._id,
        data: editingCategory,
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingCategory(null);
        }
      })).unwrap();
    } catch (error) {
      // Error được handle trong thunk
      console.error("Không cập nhật được danh mục:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteCategoryThunk({
        id,
        onSuccess: () => {
          // Có thể thêm logic khác nếu cần
        }
      })).unwrap();
    } catch (error) {
      // Error được handle trong thunk
      console.error("Failed to delete category:", error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Thể loại</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>Tạo danh mục mới cho nội dung của bạn.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Sci-Fi"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Miêu tả</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Loại danh mục</Label>
                <RadioGroup
                  value={newCategory.type}
                  onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="movie" />
                    <Label htmlFor="movie">Cho phim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story" id="story" />
                    <Label htmlFor="story">Cho truyện</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Cả hai</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newCategory.isActive}
                  onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
                />
                <Label htmlFor="active">Đang hoạt động</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy bỏ
              </Button>
              <Button onClick={handleAdd} disabled={!newCategory.name || loading}>
                {loading ? "Đang tạo..." : "Tạo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Lọc</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 font-medium border-b">
              <div className="col-span-3">Tên</div>
              <div className="col-span-4">Mô tả</div>
              <div className="col-span-2">Loại</div>
              <div className="col-span-1 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Hành động</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Đang tải danh mục...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Không tìm thấy danh mục nào
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category._id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-3 font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {category.name}
                    </div>
                    <div className="col-span-4 text-muted-foreground">{category.description}</div>
                    <div className="col-span-2">
                      <Badge variant="outline">
                        {category.type === "movie"
                          ? "Cho phim"
                          : category.type === "story"
                            ? "Cho truyện"
                            : "Cả hai"}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-center">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4 mr-2" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(category._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>Thay đổi thông tin chi tiết về danh mục.</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên danh mục</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Miêu tả</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Loại danh mục</Label>
                <RadioGroup
                  value={editingCategory.type}
                  onValueChange={(value) => setEditingCategory({ ...editingCategory, type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="edit-movie" />
                    <Label htmlFor="edit-movie">Cho phim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story" id="edit-story" />
                    <Label htmlFor="edit-story">Cho truyện</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="edit-both" />
                    <Label htmlFor="edit-both">Cả hai</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingCategory.isActive}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, isActive: checked })}
                />
                <Label htmlFor="edit-active">Đang hoạt động</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}