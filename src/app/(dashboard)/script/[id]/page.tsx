"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  FileText,
  Calendar,
  Film,
  User,
  Clock,
  Save,
  X,
  Copy,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import { UpdateScriptData } from "@/interface/script.interface";
import { clearSelectedScript } from "@/app/redux/script/slice.script";
import { getScriptByIdThunk, updateScriptThunk, deleteScriptThunk } from "@/app/redux/script/thunk.script";

const scriptTypes = [
  { value: "shooting", label: "Shooting Script" },
  { value: "draft", label: "Draft Script" },
  { value: "final", label: "Final Script" },
  { value: "revision", label: "Revision Script" },
];

export default function DetailScriptPage() {
  const router = useRouter();
  const params = useParams();
  const scriptId = params?.id as string;

  const dispatch = useDispatch<AppDispatch>();
  const { selectedScript, loading } = useSelector((state: RootState) => state.script);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content: "",
    type: ""
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (scriptId) {
      dispatch(getScriptByIdThunk(scriptId));
    }

    return () => {
      dispatch(clearSelectedScript());
    };
  }, [scriptId, dispatch]);

  useEffect(() => {
    if (selectedScript && !isEditing) {
      setEditForm({
        title: selectedScript.title,
        description: selectedScript.description,
        content: selectedScript.content,
        type: selectedScript.type
      });
    }
  }, [selectedScript, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedScript) {
      setEditForm({
        title: selectedScript.title,
        description: selectedScript.description,
        content: selectedScript.content,
        type: selectedScript.type
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedScript) return;

    const updateData: UpdateScriptData = {
      title: editForm.title,
      description: editForm.description,
      content: editForm.content,
      type: editForm.type
    };

    try {
      await dispatch(updateScriptThunk({
        id: selectedScript._id,
        data: updateData,
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Đã cập nhật kịch bản thành công");
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to update script:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedScript) return;

    try {
      await dispatch(deleteScriptThunk({
        ids: [selectedScript._id],
        onSuccess: () => {
          toast.success("Đã xóa kịch bản thành công");
          router.push("/scripts");
        }
      })).unwrap();
    } catch (error) {
      console.error("Failed to delete script:", error);
    }
  };

  const handleDownload = () => {
    if (!selectedScript) return;

    const element = document.createElement("a");
    const file = new Blob([selectedScript.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedScript.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Tải kịch bản thành công");
  };

  const handleCopyContent = () => {
    if (!selectedScript) return;

    navigator.clipboard.writeText(selectedScript.content).then(() => {
      toast.success("Sao chép kịch bản thành công");
    }).catch(() => {
      toast.error("Không sao chép được nội dung");
    });
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Copy đường dẫn kịch bản thành công");
      setShareDialogOpen(false);
    }).catch(() => {
      toast.error("Không sao chép được đường dẫn");
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      shooting: "bg-blue-100 text-blue-800 border-blue-200",
      final: "bg-green-100 text-green-800 border-green-200",
      revision: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  const getEstimatedReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải danh sách kịch bản...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedScript) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy kịch bản</h2>
            <p className="text-muted-foreground mb-4">Kịch bản bạn đang tìm kiếm hiện không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => router.push("/scripts")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách kịch bản
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/scripts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              {isEditing ? (
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-3xl font-bold border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                />
              ) : (
                selectedScript.title
              )}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Film className="h-4 w-4" />
                <span>{selectedScript.movieId?.title || "Phim không rõ"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Tạo {formatDate(selectedScript.createdAt)}</span>
              </div>
              {selectedScript.updatedAt !== selectedScript.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Đã cập nhật {formatDate(selectedScript.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Hủy bỏ
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Tải về
              </Button>
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <Button variant="outline" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ
                </Button>
              </Dialog>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa bỏ
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa kịch bản</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa không? "{selectedScript.title}"? Không thể hoàn tác hành động này.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Xóa bỏ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Script Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin kịch bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Kiểu</Label>
                {isEditing ? (
                  <Select
                    value={editForm.type}
                    onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                  >
                    <SelectTrigger className="mt-1">
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
                ) : (
                  <div className="mt-1">
                    <Badge className={getTypeColor(selectedScript.type)}>
                      {scriptTypes.find(t => t.value === selectedScript.type)?.label || selectedScript.type}
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Miêu tả</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="mt-1"
                    placeholder="Script description..."
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedScript.description || "Không có mô tả nào được cung cấp"}
                  </p>
                )}
              </div>

              <Separator />

              {/* Statistics */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thống kê</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Từ:</span>
                    <div className="font-medium">{getWordCount(selectedScript.content).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ký tự:</span>
                    <div className="font-medium">{getCharCount(selectedScript.content).toLocaleString()}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Thời gian đọc ước tính:</span>
                    <div className="font-medium">{getEstimatedReadTime(selectedScript.content)} phút</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movie Info */}
          {selectedScript.movieId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chi tiết phim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Tiêu đề</Label>
                  <p className="mt-1 font-medium">{selectedScript.movieId.title}</p>
                </div>

                {selectedScript.movieId.description && (
                  <div>
                    <Label className="text-sm font-medium">Mô tả</Label>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {selectedScript.movieId.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Số tập:</span>
                    <div className="font-medium">{selectedScript.movieId.totalEpisodes}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <div className="font-medium capitalize">{selectedScript.movieId.status}</div>
                  </div>
                </div>

                {selectedScript.movieId.releaseDate && (
                  <div>
                    <span className="text-muted-foreground text-sm">Ngày phát hành:</span>
                    <div className="font-medium">{formatDate(new Date(selectedScript.movieId.releaseDate))}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Nội dung tập lệnh</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyContent}
                    title="Sao chép nội dung"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="min-h-[600px] font-mono text-sm leading-relaxed"
                  placeholder="Nhập nội dung tập lệnh ở đây..."
                />
              ) : (
                <div className={`border rounded-md p-4 bg-muted/20 overflow-auto ${isFullscreen ? "h-[calc(100vh-12rem)]" : "max-h-[600px]"
                  }`}>
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {selectedScript.content || "Không có nội dung nào khả dụng"}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ tập lệnh</DialogTitle>
            <DialogDescription>
              Chia sẻ tập lệnh này với người khác bằng cách sao chép liên kết bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={window.location.href}
              readOnly
              className="flex-1"
            />
            <Button onClick={handleShare}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}