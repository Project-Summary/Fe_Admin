'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Save, Trash, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
  getSummaryThunk,
  generateSummaryThunk,
  updateSummaryThunk,
  deleteSummaryThunk,
} from '@/app/redux/story/thunk.story';
import { toast } from 'sonner';

interface StorySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
}

export default function StorySummaryModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
}: StorySummaryModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSummary, summaryLoading } = useSelector(
    (state: RootState) => state.story
  );

  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Lấy tóm tắt khi mở modal
  useEffect(() => {
    if (isOpen && storyId) {
      dispatch(getSummaryThunk(storyId));
    }
  }, [isOpen, storyId, dispatch]);

  // Cập nhật nội dung chỉnh sửa khi tóm tắt thay đổi
  useEffect(() => {
    if (currentSummary) {
      setEditContent(currentSummary.content);
    }
  }, [currentSummary]);

  const handleGenerateSummary = async () => {
    try {
      await dispatch(
        generateSummaryThunk({
          id: storyId,
          onSuccess: () => {
            toast.success('Tạo tóm tắt thành công!');
          },
        })
      ).unwrap();
    } catch (error) {
      console.error('Lỗi khi tạo tóm tắt:', error);
    }
  };

  const handleSaveSummary = async () => {
    if (!currentSummary) return;

    try {
      await dispatch(
        updateSummaryThunk({
          id: currentSummary.id,
          content: editContent,
          onSuccess: () => {
            setEditMode(false);
            toast.success('Cập nhật tóm tắt thành công!');
          },
        })
      ).unwrap();
    } catch (error) {
      console.error('Lỗi khi cập nhật tóm tắt:', error);
    }
  };

  const handleDeleteSummary = async () => {
    if (!currentSummary) return;

    try {
      await dispatch(
        deleteSummaryThunk({
          id: currentSummary.id,
          onSuccess: () => {
            toast.success('Xóa tóm tắt thành công!');
          },
        })
      ).unwrap();
    } catch (error) {
      console.error('Lỗi khi xóa tóm tắt:', error);
    }
  };
  const handleClose = () => {
    setEditMode(false);
    setEditContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Tóm tắt truyện
          </DialogTitle>
          <DialogDescription>
            Tóm tắt cho: <strong>{storyTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {summaryLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Đang tải tóm tắt...
                </p>
              </div>
            </div>
          ) : currentSummary ? (
            <div className="space-y-4">
              {/* Thông tin tóm tắt */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Tạo lúc: {new Date(currentSummary.createdAt).toLocaleDateString()}
                  </Badge>
                  {currentSummary.updatedAt !== currentSummary.createdAt && (
                    <Badge variant="outline">
                      Cập nhật: {new Date(currentSummary.updatedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tạo lại
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Hủy' : 'Chỉnh sửa'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSummary}
                    disabled={summaryLoading}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>

              {/* Nội dung tóm tắt */}
              {editMode ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Chỉnh sửa nội dung tóm tắt..."
                    className="min-h-[300px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditContent(currentSummary.content);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveSummary}
                      disabled={summaryLoading || editContent === currentSummary.content}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border p-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {currentSummary.content}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-4 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Chưa có tóm tắt</h3>
                <p className="text-sm text-muted-foreground">
                  Hãy tạo một tóm tắt bằng AI cho truyện này
                </p>
              </div>
              <Button onClick={handleGenerateSummary} disabled={summaryLoading}>
                {summaryLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tạo tóm tắt
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
