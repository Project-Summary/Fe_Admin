"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, MoreHorizontal, FileText, Eye, Film } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import { CreateScriptData, UpdateScriptData, DataSCript } from "@/interface/script.interface";
import { clearSelectedScript } from "@/app/redux/script/slice.script";
import { getAllScriptsThunk, createScriptThunk, updateScriptThunk, deleteScriptThunk, getScriptByIdThunk } from "@/app/redux/script/thunk.script";

const scriptTypes = [
  { value: "shooting", label: "Kịch bản quay" },
  { value: "draft", label: "Bản nháp kịch bản" },
  { value: "final", label: "Kịch bản hoàn chỉnh" },
  { value: "revision", label: "Kịch bản chỉnh sửa" },
];

export default function ScriptsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { scripts, loading, selectedScript } = useSelector((state: RootState) => state.script);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newScript, setNewScript] = useState<CreateScriptData>({
    title: "",
    description: "",
    content: "",
    type: "draft"
  });
  const [editingScript, setEditingScript] = useState<DataSCript | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getAllScriptsThunk());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!newScript.title || !newScript.content) return;

    try {
      await dispatch(createScriptThunk({
        data: newScript,
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewScript({
            title: "",
            description: "",
            content: "",
            type: "draft"
          });
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to create script:", error);
    }
  };

  const handleEdit = (script: DataSCript) => {
    setEditingScript({ ...script });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingScript || !editingScript._id) return;

    const updateData: UpdateScriptData = {
      title: editingScript.title,
      description: editingScript.description,
      content: editingScript.content,
      type: editingScript.type
    };

    try {
      await dispatch(updateScriptThunk({
        id: editingScript._id,
        data: updateData,
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingScript(null);
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to update script:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteScriptThunk({
        ids: [id],
        onSuccess: () => {
          // Success handled in thunk
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to delete script:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedScripts.length === 0) return;

    try {
      await dispatch(deleteScriptThunk({
        ids: selectedScripts,
        onSuccess: () => {
          setSelectedScripts([]);
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to delete scripts:", error);
    }
  };

  const handleViewScript = async (script: DataSCript) => {
    await dispatch(getScriptByIdThunk(script._id));
    setViewDialogOpen(true);
  };

  const filteredScripts = scripts.filter((script: DataSCript) => {
    const matchesSearch =
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.movieId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || script.type === filterType;

    return matchesSearch && matchesType;
  });

  const toggleScriptSelection = (scriptId: string) => {
    setSelectedScripts(prev =>
      prev.includes(scriptId)
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedScripts.length === filteredScripts.length) {
      setSelectedScripts([]);
    } else {
      setSelectedScripts(filteredScripts.map((script: DataSCript) => script._id));
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800",
      shooting: "bg-blue-100 text-blue-800",
      final: "bg-green-100 text-green-800",
      revision: "bg-purple-100 text-purple-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý kịch bản</h1>
          <p className="text-muted-foreground">Quản lý kịch bản phim và truyện</p>
        </div>
        <div className="flex gap-2">
          {selectedScripts.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa mục đã chọn ({selectedScripts.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />Thêm kịch bản
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm kịch bản</DialogTitle>
                <DialogDescription>Tạo kịch bản mới cho một bộ phim hoặc câu chuyện.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tiêu đề kịch bản</Label>
                  <Input
                    id="title"
                    value={newScript.title}
                    onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                    placeholder="e.g., The Dark Knight - Final Script"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Loại tập lệnh</Label>
                  <Select
                    value={newScript.type}
                    onValueChange={(value) => setNewScript({ ...newScript, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scriptTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Miêu tả</Label>
                  <Textarea
                    id="description"
                    value={newScript.description}
                    onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về kịch bản.."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Nội dung kịch bản</Label>
                  <Textarea
                    id="content"
                    value={newScript.content}
                    onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
                    placeholder="Nhập nội dung kịch bản vào đây..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!newScript.title || !newScript.content || loading}
                >
                  {loading ? "Đang tạo..." : "Tạo tập lệnh"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scripts by title, movie, or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả các loại</SelectItem>
            {scriptTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 font-medium border-b">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedScripts.length === filteredScripts.length && filteredScripts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </div>
              <div className="col-span-3">Tiêu đề</div>
              <div className="col-span-2">Phim/Câu chuyện</div>
              <div className="col-span-2">Loại</div>
              <div className="col-span-2">Đã tạo</div>
              <div className="col-span-2 text-right">Hành động</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Đang tải tập lệnh...
                </div>
              ) : filteredScripts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Không tìm thấy tập lệnh nào
                </div>
              ) : (
                filteredScripts.map((script) => (
                  <div key={script._id} className="grid grid-cols-12 p-4 items-center hover:bg-muted/50">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedScripts.includes(script._id)}
                        onChange={() => toggleScriptSelection(script._id)}
                        className="rounded"
                      />
                    </div>
                    <div className="col-span-3 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">{script.title}</div>
                        {script.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {script.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {script.movieId?.title || "Không rõ"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge className={getTypeColor(script.type)}>
                        {scriptTypes.find(t => t.value === script.type)?.label || script.type}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {formatDate(script.createdAt)}
                    </div>
                    <div className="col-span-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewScript(script)}>
                            <Eye className="h-4 w-4 mr-2" /> Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(script)}>
                            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(script._id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tập lệnh</DialogTitle>
            <DialogDescription>Cập nhật chi tiết và nội dung tập lệnh.</DialogDescription>
          </DialogHeader>
          {editingScript && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Tiêu đề kịch bản</Label>
                <Input
                  id="edit-title"
                  value={editingScript.title}
                  onChange={(e) => setEditingScript({ ...editingScript, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Loại kịch bản</Label>
                <Select
                  value={editingScript.type}
                  onValueChange={(value) => setEditingScript({ ...editingScript, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scriptTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editingScript.description}
                  onChange={(e) => setEditingScript({ ...editingScript, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Nội dung kịch bản</Label>
                <Textarea
                  id="edit-content"
                  value={editingScript.content}
                  onChange={(e) => setEditingScript({ ...editingScript, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Script Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        if (!open) dispatch(clearSelectedScript());
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedScript?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedScript?.movieId?.title} • {scriptTypes.find(t => t.value === selectedScript?.type)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedScript?.description && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Mô tả</h4>
                <p className="text-muted-foreground">{selectedScript.description}</p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">Nội dung tập lệnh</h4>
              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto bg-muted/20">
                <pre className="whitespace-pre-wrap text-sm">
                  {selectedScript?.content || "No content available"}
                </pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Đóng
            </Button>
            {selectedScript && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedScript);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa tập lệnh
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}