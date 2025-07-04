import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify'; // hoặc thư viện toast bạn đang dùng
import { CreateStoryData, StoryFilterData, UpdateStoryData } from './interface.story';
import StoryAPI from './request.story';

// CRUD Operations
export const createStoryThunk = createAsyncThunk('stories/create', async (
    { data, onSuccess }: { data: CreateStoryData; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.createStory(data);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tạo câu chuyện');
        return rejectWithValue('Lỗi khi tạo câu chuyện');
    }
});

export const getAllStoriesThunk = createAsyncThunk('stories/getAll', async (
    { filterDto }: { filterDto?: StoryFilterData }, { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getAllStories(filterDto);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải truyện');
        return rejectWithValue('Lỗi khi tải truyện');
    }
});

export const getStoryByIdThunk = createAsyncThunk('stories/getById', async (
    id: string,
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getStoryById(id);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải truyện');
        return rejectWithValue('Lỗi khi tải truyện');
    }
});

export const updateStoryThunk = createAsyncThunk('stories/update', async (
    { id, data, onSuccess }: { id: string; data: UpdateStoryData; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.updateStory(id, data);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi cập nhật câu chuyện');
        return rejectWithValue('Lỗi khi cập nhật câu chuyện');
    }
});

export const deleteStoryThunk = createAsyncThunk('stories/delete', async (
    { id, onSuccess }: { id: string; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.deleteStory(id);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi xóa truyện');
        return rejectWithValue('Lỗi khi xóa truyện');
    }
});

export const deleteStoriesThunk = createAsyncThunk('stories/deleteMultiple', async (
    { storyIds, onSuccess }: { storyIds: string | string[]; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.deleteStories(storyIds);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi xóa truyện');
        return rejectWithValue('Lỗi khi xóa truyện');
    }
});

// Get Stories by Category and Filters
export const getPopularStoriesThunk = createAsyncThunk('stories/getPopular', async (
    { limit, category }: { limit?: number; category?: string } = {},
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getPopularStories(limit, category);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải những câu chuyện phổ biến');
        return rejectWithValue('Lỗi khi tải những câu chuyện phổ biến');
    }
});

export const getRecentStoriesThunk = createAsyncThunk('stories/getRecent', async (
    { limit, category }: { limit?: number; category?: string } = {},
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getRecentStories(limit, category);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải các câu chuyện gần đây');
        return rejectWithValue('Lỗi khi tải các câu chuyện gần đây');
    }
});

export const getTopRatedStoriesThunk = createAsyncThunk('stories/getTopRated', async (
    { limit, category }: { limit?: number; category?: string } = {},
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getTopRatedStories(limit, category);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải những câu chuyện được đánh giá cao nhất');
        return rejectWithValue('Lỗi khi tải những câu chuyện được đánh giá cao nhất');
    }
});

export const getStoriesByCategoryThunk = createAsyncThunk('stories/getByCategory', async (
    { categoryId, limit, page }: { categoryId: string; limit?: number; page?: number },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getStoriesByCategory(categoryId, limit, page);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải các câu chuyện được đánh giá cao nhất');
        return rejectWithValue('Lỗi khi tải các câu chuyện được đánh giá cao nhất');
    }
});

// Summary Operations
export const generateSummaryThunk = createAsyncThunk('stories/generateSummary', async (
    { id, onSuccess }: { id: string; onSuccess?: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.generateSummary(id);
        onSuccess?.();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tạo tóm tắt');
        return rejectWithValue('Lỗi khi tạo tóm tắt');
    }
});

export const getSummaryThunk = createAsyncThunk('stories/getSummary', async (
    id: string,
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.getSummary(id);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tải tóm tắt');
        return rejectWithValue('Lỗi khi tải tóm tắt');
    }
});

export const updateSummaryThunk = createAsyncThunk('stories/updateSummary', async (
    { id, content, onSuccess }: { id: string; content: string; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.updateSummary(id, content);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi cập nhật tóm tắt');
        return rejectWithValue('Lỗi khi cập nhật tóm tắt');
    }
});

export const deleteSummaryThunk = createAsyncThunk('stories/deleteSummary', async (
    { id, onSuccess }: { id: string; onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.deleteSummary(id);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi xóa tóm tắt');
        return rejectWithValue('Lỗi khi xóa tóm tắt');
    }
});

// Statistics Operations
export const incrementViewCountThunk = createAsyncThunk('stories/incrementView', async (
    id: string,
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.incrementViewCount(id);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi khi tăng số lượt xem');
        return rejectWithValue('Lỗi khi tăng số lượt xem');
    }
});

export const likeStoryThunk = createAsyncThunk('stories/like', async (
    { id, onSuccess }: { id: string; onSuccess?: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.likeStory(id);
        onSuccess?.();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi thích câu chuyện');
        return rejectWithValue('Lỗi thích câu chuyện');
    }
});

export const rateStoryThunk = createAsyncThunk('stories/rate', async (
    { id, rating, onSuccess }: { id: string; rating: number; onSuccess?: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.rateStory(id, rating);
        onSuccess?.();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi đánh giá câu chuyện');
        return rejectWithValue('Lỗi đánh giá câu chuyện');
    }
});


export const summaryStoryThunk = createAsyncThunk('stories/summary', async (
    { id, script, onSuccess }: { id: string, script: string, onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await StoryAPI.summaryStory(id, script);
        onSuccess();
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }
        toast.error('Lỗi đánh giá câu chuyện');
        return rejectWithValue('Lỗi đánh giá câu chuyện');
    }
})