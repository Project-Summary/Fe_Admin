// app/redux/requireSummary/thunk.requireSummary.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';
import { 
  CreateRequireSummaryData, 
  UpdateRequireSummaryData, 
  UpdateRequireSummaryStatusData,
  GetRequireSummariesQuery 
} from './interface.requireSummary';

// User thunks (existing)
export const createRequireSummaryThunk = createAsyncThunk(
  'requireSummary/create',
  async (data: CreateRequireSummaryData, { rejectWithValue }) => {
    try {
      const response = await API.post('/require-summaries', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không tạo được tóm tắt yêu cầu');
    }
  }
);

export const getMyRequireSummariesThunk = createAsyncThunk(
  'requireSummary/getMy',
  async (params: GetRequireSummariesQuery = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/require-summaries/my', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải tóm tắt yêu cầu');
    }
  }
);

export const getMyStatisticsThunk = createAsyncThunk(
  'requireSummary/getMyStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/require-summaries/statistics');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy số liệu thống kê');
    }
  }
);

export const updateRequireSummaryThunk = createAsyncThunk(
  'requireSummary/update',
  async ({ id, data }: { id: string; data: UpdateRequireSummaryData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/require-summaries/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không cập nhật được yêu cầu tóm tắt');
    }
  }
);

export const deleteRequireSummariesThunk = createAsyncThunk(
  'requireSummary/delete',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await API.patch('/require-summaries', { ids });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không xóa được yêu cầu tóm tắt');
    }
  }
);

// Admin thunks
export const getAllRequireSummariesThunk = createAsyncThunk(
  'requireSummary/admin/getAll',
  async (params: GetRequireSummariesQuery = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/require-summaries/admin', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải tóm tắt yêu cầu của quản trị viên');
    }
  }
);

export const getAllRequireSummariesStatsThunk = createAsyncThunk(
  'requireSummary/admin/getStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/require-summaries/admin/statistics');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy số liệu thống kê quản trị');
    }
  }
);

export const getSummaryByIdThunk = createAsyncThunk(
  'requireSummary/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.get(`/require-summaries/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải tóm tắt yêu cầu');
    }
  }
);

export const updateRequireSummaryStatusThunk = createAsyncThunk(
  'requireSummary/admin/updateStatus',
  async ({ id, data }: { id: string; data: UpdateRequireSummaryStatusData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/require-summaries/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không cập nhật được trạng thái tóm tắt yêu cầu');
    }
  }
);

export const deleteAdminRequireSummariesThunk = createAsyncThunk(
  'requireSummary/admin/delete',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await API.patch('/require-summaries/admin', { ids });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không xóa được tóm tắt yêu cầu của quản trị viên');
    }
  }
);
