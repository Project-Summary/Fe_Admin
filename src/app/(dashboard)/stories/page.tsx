'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Loader2,
    AlertCircle,
    RefreshCw,
    Scroll,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
    getAllStoriesThunk,
    deleteStoryThunk,
    deleteStoriesThunk,
    updateStoryThunk,
} from '@/app/redux/story/thunk.story';
import { Story } from '@/app/redux/story/interface.story';
import StoryCard from '@/components/stories/StoryCard';
import StoryFilters from '@/components/stories/StoryFilters';
import StoryStats from '@/components/stories/StoryStats';
import StorySummaryModal from '@/components/stories/StorySummaryModal';

// Import components

export default function StoriesPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { stories, loading, error } = useSelector((state: RootState) => state.story);

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    // Selection states
    const [selectedStories, setSelectedStories] = useState<string[]>([]);

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

    // Loading states
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Summary modal states
    const [summaryModalOpen, setSummaryModalOpen] = useState(false);
    const [selectedStoryForSummary, setSelectedStoryForSummary] = useState<{
        id: string;
        title: string;
    } | null>(null);

    // Fetch stories on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Fetch all data function
    const fetchAllData = useCallback(async () => {
        try {
            await dispatch(getAllStoriesThunk({}));
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    }, [dispatch]);

    // Refresh data handler
    const handleRefresh = () => {
        fetchAllData();
        toast.success('Đã làm mới dữ liệu');
    };

    // Apply filters and sorting to stories
    const filteredStories = stories
        .filter((story: Story) => {
            // Search filter
            if (searchQuery && !story.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all' && story.status !== statusFilter) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && !story.categories.some((c: any) => c.name.toLowerCase() === categoryFilter)) {
                return false;
            }

            return true;
        })
        .sort((a: Story, b: Story) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'views-high':
                    return b.statistics.views - a.statistics.views;
                case 'views-low':
                    return a.statistics.views - b.statistics.views;
                case 'likes-high':
                    return b.statistics.likes - a.statistics.likes;
                case 'likes-low':
                    return a.statistics.likes - b.statistics.likes;
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'rating-high':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'rating-low':
                    return (a.averageRating || 0) - (b.averageRating || 0);
                default:
                    return 0;
            }
        });

    // Story selection handlers
    const handleSelectStory = (id: string) => {
        if (selectedStories.includes(id)) {
            setSelectedStories(selectedStories.filter((storyId: string) => storyId !== id));
        } else {
            setSelectedStories([...selectedStories, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedStories.length === filteredStories.length) {
            setSelectedStories([]);
        } else {
            setSelectedStories(filteredStories.map((story: Story) => story._id));
        }
    };

    // Delete handlers
    const handleDeleteStory = (id: string) => {
        setStoryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteStory = async () => {
        if (!storyToDelete) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteStoryThunk({
                id: storyToDelete,
                onSuccess: () => {
                    setSelectedStories(selectedStories.filter((id: string) => id !== storyToDelete));
                    setDeleteDialogOpen(false);
                    setStoryToDelete(null);
                    dispatch(getAllStoriesThunk({}));
                    toast.success('Đã xóa truyện thành công');
                }
            })).unwrap();
        } catch (error) {
            console.error('Lỗi khi xóa truyện:', error);
            toast.error('Không xóa được truyện: ' + (error as any)?.message || 'Lỗi không xác định');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDelete = () => {
        if (selectedStories.length === 0) return;
        setBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = async () => {
        setIsDeleting(true);
        try {
            await dispatch(deleteStoriesThunk({
                storyIds: selectedStories,
                onSuccess: () => {
                    setSelectedStories([]);
                    setBulkDeleteDialogOpen(false);
                    dispatch(getAllStoriesThunk({}));
                    toast.success(`${selectedStories.length} câu chuyện đã được xóa thành công`);
                }
            })).unwrap();
        } catch (error) {
            console.error('Error bulk deleting stories:', error);
            toast.error('Không xóa được một số câu chuyện');
        } finally {
            setIsDeleting(false);
        }
    };

    // Status change handler
    const handleStatusChange = async (id: string, newStatus: string) => {
        const story = stories.find((s: Story) => s._id === id);
        if (!story) return;

        setUpdatingStatus(id);
        try {
            await dispatch(updateStoryThunk({
                id,
                data: { status: newStatus as any },
                onSuccess: () => {
                    toast.success(`Trạng thái câu chuyện đã được cập nhật thành ${newStatus}`);
                    dispatch(getAllStoriesThunk({}));
                }
            })).unwrap();
        } catch (error) {
            console.error('Error updating story status:', error);
            toast.error('Không cập nhật được trạng thái câu chuyện');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Summary modal handlers
    const handleViewSummary = (storyId: string) => {
        router.push(`stories/${storyId}`);
    };

    const handleCloseSummaryModal = () => {
        setSummaryModalOpen(false);
        setSelectedStoryForSummary(null);
    };

    // Edit story handler
    const handleEditStory = (id: string) => {
        router.push(`/stories/${id}/edit`);
    };

    // Reset filters handler
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSortBy('newest');
    };

    // Calculate statistics
    const stats = {
        total: stories.length,
        published: stories.filter((s: Story) => s.status === 'published').length,
        drafts: stories.filter((s: Story) => s.status === 'draft').length,
        aiGenerated: stories.filter((s: Story) => s.isAIGenerated).length,
        totalViews: stories.reduce((acc, s) => acc + s.statistics.views, 0),
        totalLikes: stories.reduce((acc, s) => acc + s.statistics.likes, 0),
        averageRating: stories.length > 0
            ? stories.reduce((acc, s) => acc + (s.averageRating || 0), 0) / stories.length
            : 0,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Câu chuyện</h1>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                    <Link href="/stories/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm Câu chuyện Mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Lỗi: {error}</span>
                        <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <StoryStats stats={stats} />

            {/* Filters */}
            <StoryFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onResetFilters={handleResetFilters}
                totalResults={filteredStories.length}
                totalItems={stories.length}
            />

            {/* Bulk Actions */}
            {selectedStories.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-sm">
                                    {selectedStories.length} {selectedStories.length === 1 ? 'story' : 'stories'} đã chọn
                                </p>
                                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                    {selectedStories.length === filteredStories.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedStories([])}>
                                    Hủy
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            Đang xóa...
                                        </>
                                    ) : (
                                        'Xóa mục đã chọn'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stories List */}
            <Card>
                <CardContent className="p-0">
                    {loading && stories.length === 0 ? (
                        <div className="flex h-80 items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="text-sm text-muted-foreground">Đang tải câu chuyện...</p>
                            </div>
                        </div>
                    ) : filteredStories.length === 0 ? (
                        <div className="flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
                            <Scroll className="h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-medium">
                                {stories.length === 0 ? 'No stories yet' : 'No stories found'}
                            </h3>
                            <p className="text-muted-foreground">
                                {stories.length === 0
                                    ? 'Tạo câu chuyện đầu tiên của bạn để bắt đầu'
                                    : 'Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn'
                                }
                            </p>
                            {stories.length === 0 && (
                                <Link href="/stories/new">
                                    <Button className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm câu chuyện đầu tiên của bạn
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="grid gap-4">
                                {filteredStories.map((story: Story) => (
                                    <StoryCard
                                        key={story._id}
                                        story={story}
                                        isSelected={selectedStories.includes(story._id)}
                                        onSelect={handleSelectStory}
                                        onEdit={handleEditStory}
                                        onDelete={handleDeleteStory}
                                        onStatusChange={handleStatusChange}
                                        onViewSummary={handleViewSummary}
                                        isUpdatingStatus={updatingStatus === story._id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Single Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa Câu chuyện</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa câu chuyện này không? Hành động này không thể hoàn tác và cũng sẽ xóa tóm tắt câu chuyện nếu có.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteStory}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                'Xóa câu chuyện'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa nhiều câu chuyện</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa {selectedStories.length} {selectedStories.length === 1 ? 'story' : 'stories'} không?
                            Không thể hoàn tác hành động này và cũng sẽ xóa tất cả các bản tóm tắt liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                `Xóa ${selectedStories.length} Stories`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Summary Modal */}
            {selectedStoryForSummary && (
                <StorySummaryModal
                    isOpen={summaryModalOpen}
                    onClose={handleCloseSummaryModal}
                    storyId={selectedStoryForSummary.id}
                    storyTitle={selectedStoryForSummary.title}
                />
            )}
        </div>
    );
}
