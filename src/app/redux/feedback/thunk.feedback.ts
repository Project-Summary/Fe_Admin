// store/feedback/thunk.feedback.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import {
    CreateFeedbackData,
    UpdateFeedbackData,
    QueryFeedbackParams,
    FeedbackListResponse,
    ContentFeedbackResponse,
    OverallFeedbackStats,
    Feedback,
    BulkDeleteResponse,
} from '@/interface/feedback.interface';
import FeedbackAPI from './request.feedback';

const handleError = (error: unknown, fallbackMessage: string, rejectWithValue: any) => {
    if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return rejectWithValue(error.response?.data.message);
    }
    toast.error(fallbackMessage);
    return rejectWithValue(fallbackMessage);
};

// Create feedback
export const createFeedbackThunk = createAsyncThunk(
    'feedback/create',
    async (
        { data, onSuccess }: { data: CreateFeedbackData; onSuccess?: () => void },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.createFeedback(data);
            onSuccess?.();
            return res.data as Feedback;
        } catch (error) {
            return handleError(error, 'Lỗi khi tạo phản hồi', rejectWithValue);
        }
    }
);

// Get all feedbacks
export const getAllFeedbacksThunk = createAsyncThunk(
    'feedback/getAll',
    async ({ params }: { params?: QueryFeedbackParams }, { rejectWithValue }) => {
        try {
            const res = await FeedbackAPI.getAllFeedback(params);
            return res.data as FeedbackListResponse;
        } catch (error) {
            return handleError(error, 'Lỗi khi lấy phản hồi', rejectWithValue);
        }
    }
);

// Get feedback statistics
export const getFeedbackStatsThunk = createAsyncThunk(
    'feedback/getStats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await FeedbackAPI.getFeedbackStats();
            return res.data as OverallFeedbackStats;
        } catch (error) {
            return handleError(error, 'Lỗi khi lấy số liệu thống kê phản hồi', rejectWithValue);
        }
    }
);

// Get feedbacks by content
export const getFeedbackByContentThunk = createAsyncThunk(
    'feedback/getByContent',
    async (
        { contentId, contentType, page = 1, limit = 10 }: {
            contentId: string;
            contentType: 'movie' | 'story';
            page?: number;
            limit?: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.getFeedbackByContent(contentId, contentType, page, limit);
            return res.data as ContentFeedbackResponse;
        } catch (error) {
            return handleError(error, 'Lỗi khi lấy phản hồi nội dung', rejectWithValue);
        }
    }
);

// Get my feedbacks
export const getMyFeedbacksThunk = createAsyncThunk(
    'feedback/getMy',
    async (
        { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.getMyFeedbacks(page, limit);
            return res.data as FeedbackListResponse;
        } catch (error) {
            return handleError(error, 'Lỗi khi lấy phản hồi của tôi', rejectWithValue);
        }
    }
);

// Get feedback by ID
export const getFeedbackByIdThunk = createAsyncThunk(
    'feedback/getById',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await FeedbackAPI.getFeedbackById(id);
            return res.data as Feedback;
        } catch (error) {
            return handleError(error, 'Lỗi khi lấy phản hồi theo ID', rejectWithValue);
        }
    }
);

// Update feedback
export const updateFeedbackThunk = createAsyncThunk(
    'feedback/update',
    async (
        { id, data, onSuccess }: { id: string; data: UpdateFeedbackData; onSuccess?: () => void },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.updateFeedback(id, data);
            onSuccess?.();
            return res.data as Feedback;
        } catch (error) {
            return handleError(error, 'Lỗi khi cập nhật phản hồi', rejectWithValue);
        }
    }
);

// Delete feedback
export const deleteFeedbackThunk = createAsyncThunk(
    'feedback/delete',
    async (
        { id, onSuccess }: { id: string; onSuccess?: () => void },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.deleteFeedback(id);
            onSuccess?.();
            return { id, message: res.data.message };
        } catch (error) {
            return handleError(error, 'Lỗi khi xóa phản hồi', rejectWithValue);
        }
    }
);

// Bulk delete feedbacks
export const deleteBulkFeedbacksThunk = createAsyncThunk(
    'feedback/bulkDelete',
    async (
        { feedbackIds, onSuccess }: { feedbackIds: string[]; onSuccess?: () => void },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.deleteBulkFeedbacks(feedbackIds);
            toast.success(`${res.data.deletedCount} feedbacks deleted successfully!`);
            onSuccess?.();
            return { feedbackIds, ...res.data } as BulkDeleteResponse & { feedbackIds: string[] };
        } catch (error) {
            return handleError(error, 'Lỗi khi xóa phản hồi', rejectWithValue);
        }
    }
);

// Moderate feedback
export const moderateFeedbackThunk = createAsyncThunk(
    'feedback/moderate',
    async (
        { id, action, onSuccess }: {
            id: string;
            action: 'approve' | 'reject' | 'flag';
            onSuccess?: () => void;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await FeedbackAPI.moderateFeedback(id, action);
            toast.success(`Feedback ${action}d successfully!`);
            onSuccess?.();
            return res.data as Feedback;
        } catch (error) {
            return handleError(error, 'Lỗi khi kiểm duyệt phản hồi', rejectWithValue);
        }
    }
);
