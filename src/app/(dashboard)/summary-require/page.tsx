// app/admin/require-summaries/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GetRequireSummariesQuery, RequireSummary } from '@/app/redux/require-summary/interface.requireSummary';
import { selectAdminRequireSummaries, selectAdminRequireSummaryLoading, selectAdminRequireSummaryError, selectAdminRequireSummaryPagination, selectSelectedAdminRequireSummary } from '@/app/redux/require-summary/selectors.requireSummary';
import { clearAdminError, setSelectedAdminRequireSummary } from '@/app/redux/require-summary/slice.adminRequireSummary';
import { getAllRequireSummariesThunk, updateRequireSummaryStatusThunk, deleteAdminRequireSummariesThunk } from '@/app/redux/require-summary/thunk.require-summary';


interface IStatusFormRequire {
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    adminResponse: string;
    summaryContent: string;
}

const AdminRequireSummaryPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const requireSummaries = useSelector(selectAdminRequireSummaries);
    const loading = useSelector(selectAdminRequireSummaryLoading);
    const error = useSelector(selectAdminRequireSummaryError);
    const pagination = useSelector(selectAdminRequireSummaryPagination);
    const selectedSummary = useSelector(selectSelectedAdminRequireSummary);

    // Filter states
    const [filters, setFilters] = useState<GetRequireSummariesQuery>({
        page: 1,
        limit: 10,
        status: undefined,
        contentType: undefined,
        search: ''
    });

    // UI states
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusForm, setStatusForm] = useState<IStatusFormRequire>({
        status: 'pending' as const,
        adminResponse: '',
        summaryContent: ''
    });

    // Load data
    const loadRequireSummaries = useCallback(() => {
        dispatch(getAllRequireSummariesThunk(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        loadRequireSummaries();
    }, [loadRequireSummaries]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminError());
        }
    }, [error, dispatch]);

    // Handle filter changes
    const handleFilterChange = (key: keyof GetRequireSummariesQuery, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }));
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        handleFilterChange('page', page);
    };

    // Handle selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(requireSummaries.map(rs => rs._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    // Handle view detail
    const handleViewDetail = async (summary: RequireSummary) => {
        dispatch(setSelectedAdminRequireSummary(summary));
        setShowDetailModal(true);
    };

    // Handle status update
    const handleUpdateStatus = (summary: RequireSummary) => {
        dispatch(setSelectedAdminRequireSummary(summary));
        setStatusForm({
            status: summary.status,
            adminResponse: summary.adminResponse || '',
            summaryContent: summary.summaryContent || ''
        });
        setShowStatusModal(true);
    };

    const handleStatusSubmit = async () => {
        if (!selectedSummary) return;

        try {
            await dispatch(updateRequireSummaryStatusThunk({
                id: selectedSummary._id,
                data: statusForm
            })).unwrap();

            toast.success('Trạng thái đã được cập nhật thành công');
            setShowStatusModal(false);
            loadRequireSummaries();
        } catch (error: any) {
            toast.error("Có lỗi xảy ra");
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error('Vui lòng chọn các mục để xóa');
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mục không?`)) {
            try {
                await dispatch(deleteAdminRequireSummariesThunk(selectedIds)).unwrap();
                toast.success('Đã xóa mục thành công');
                setSelectedIds([]);
                loadRequireSummaries();
            } catch (error: any) {
                toast.error(error);
            }
        }
    };

    // Handle redirect to create content
    const handleCreateContent = (summary: RequireSummary) => {
        if (summary.contentType === 'movie') {
            router.push(`/movies/new?fromSummary=${summary._id}&title=${encodeURIComponent(summary.title)}&description=${encodeURIComponent(summary.description)}`);
        } else {
            router.push(`/stories/new?fromSummary=${summary._id}&title=${encodeURIComponent(summary.title)}&description=${encodeURIComponent(summary.description)}`);
        }
    };

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu Quản lý Tóm tắt</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/summary-require/stats')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Xem Thống kê
                    </button>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Xóa Đã chọn ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Đang chờ</option>
                            <option value="approved">Đã phê duyệt</option>
                            <option value="rejected">Đã từ chối</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại nội dung</label>
                        <select
                            value={filters.contentType || ''}
                            onChange={(e) => handleFilterChange('contentType', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả các loại</option>
                            <option value="movie">Phim</option>
                            <option value="story">Câu chuyện</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số mục trên mỗi trang</label>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === requireSummaries.length && requireSummaries.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tiêu đề
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : requireSummaries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy tóm tắt yêu cầu
                                    </td>
                                </tr>
                            ) : (
                                requireSummaries.map((summary) => (
                                    <tr key={summary._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(summary._id)}
                                                onChange={(e) => handleSelectItem(summary._id, e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {summary.title}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {summary.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                {summary.contentType.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={summary.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(summary.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(summary)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Xem
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(summary)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Cập nhật trạng thái
                                                </button>
                                                {summary.status === 'completed' && (
                                                    <button
                                                        onClick={() => handleCreateContent(summary)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        Tạo {summary.contentType}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước đó
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Tiếp theo
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị <span className="font-medium">{((pagination.page - 1) * filters.limit!) + 1}</span> tới{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * filters.limit!, pagination.total)}
                                    </span>{' '}
                                    trong số <span className="font-medium">{pagination.total}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSummary && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Yêu cầu chi tiết tóm tắt</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedSummary.title}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedSummary.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại nội dung</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedSummary.contentType}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <StatusBadge status={selectedSummary.status} />
                                </div>
                            </div>

                            {selectedSummary.adminResponse && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phản hồi của quản trị viên</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedSummary.adminResponse}</p>
                                </div>
                            )}

                            {selectedSummary.summaryContent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nội dung tóm tắt</label>
                                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {selectedSummary.summaryContent}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                    <label className="block font-medium">Được tạo vào lúc</label>
                                    <p>{new Date(selectedSummary.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block font-medium">Được cập nhật vào lúc</label>
                                    <p>{new Date(selectedSummary.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedSummary && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Cập nhật trạng thái</h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value as any }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Đang chờ</option>
                                    <option value="approved">Đã phê duyệt</option>
                                    <option value="rejected">Đã từ chối</option>
                                    <option value="completed">Đã hoàn thành</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phản hồi của quản trị viên</label>
                                <textarea
                                    value={statusForm.adminResponse}
                                    onChange={(e) => setStatusForm(prev => ({ ...prev, adminResponse: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập phản hồi của quản trị viên..."
                                />
                            </div>

                            {statusForm.status === 'completed' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung tóm tắt</label>
                                    <textarea
                                        value={statusForm.summaryContent}
                                        onChange={(e) => setStatusForm(prev => ({ ...prev, summaryContent: e.target.value }))}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập nội dung tóm tắt..."
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleStatusSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRequireSummaryPage;
