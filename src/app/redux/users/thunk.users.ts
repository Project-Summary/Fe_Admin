import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { UsersAPI } from './request.users';
import { CreateUserDto, UpdateUserDto, AdminUpdateUserDto, BulkUserUpdate } from '@/interface/user.interface';

export const getAllUsersThunk = createAsyncThunk('users/getAll', async (_, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.getAllUsers();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tìm kiếm người dùng');
    return rejectWithValue('Lỗi khi tìm kiếm người dùng');
  }
});

export const getCurrentUserThunk = createAsyncThunk('users/getCurrent', async (_, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.getCurrentUser();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tìm kiếm người dùng hiện tại');
    return rejectWithValue('Lỗi khi tìm kiếm người dùng hiện tại');
  }
});

export const findOneUserThunk = createAsyncThunk('users/findOne', async (id: string, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.findOneUsers(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tìm nạp người dùng');
    return rejectWithValue('Lỗi khi tìm nạp người dùng');
  }
});

export const createUserThunk = createAsyncThunk('users/create', async (
  { data, onSuccess }: { data: CreateUserDto; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const response = await UsersAPI.createUser(data);
    onSuccess();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tạo người dùng');
    return rejectWithValue('Lỗi khi tạo người dùng');
  }
});

export const updateCurrentUserThunk = createAsyncThunk('users/updateCurrent', async (
  { data, onSuccess }: { data: UpdateUserDto; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const response = await UsersAPI.updateCurrentUser(data);
    onSuccess();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi cập nhật người dùng hiện tại');
    return rejectWithValue('Lỗi khi cập nhật người dùng hiện tại');
  }
});

// Regular user update (for user profile)
export const updateUserThunk = createAsyncThunk('users/update', async (
  { id, data, onSuccess }: { id: string; data: UpdateUserDto; onSuccess: () => void },
  { rejectWithValue }
) => {

  console.log("Data : ", data);
  try {
    const response = await UsersAPI.updateUser(id, data);
    onSuccess();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi cập nhật người dùng');
    return rejectWithValue('Lỗi khi cập nhật người dùng');
  }
});

// // Admin update user (for admin operations)
// export const adminUpdateUserThunk = createAsyncThunk('users/adminUpdate', async (
//   { id, data, onSuccess }: { id: string; data: AdminUpdateUserDto; onSuccess?: () => void },
//   { rejectWithValue }
// ) => {
//   try {
//     const response = await UsersAPI.adminUpdateUser(id, data);
//     if (onSuccess) onSuccess();
//     return response.data;
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       toast.error(error.response?.data.message);
//       return rejectWithValue(error.response?.data.message);
//     }
//     toast.error('Error updating user');
//     return rejectWithValue('Error updating user');
//   }
// });

// // Bulk update users (admin only)
// export const bulkUpdateUsersThunk = createAsyncThunk('users/bulkUpdate', async (
//   { data, onSuccess }: { data: BulkUserUpdate; onSuccess?: () => void },
//   { rejectWithValue }
// ) => {
//   try {
//     const response = await UsersAPI.bulkUpdateUsers(data);
//     if (onSuccess) onSuccess();
//     return response.data;
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       toast.error(error.response?.data.message);
//       return rejectWithValue(error.response?.data.message);
//     }
//     toast.error('Error bulk updating users');
//     return rejectWithValue('Error bulk updating users');
//   }
// });

export const deleteUserThunk = createAsyncThunk('users/delete', async (id: string, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.deleteUser(id);
    return { id, ...response.data };
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi xóa người dùng');
    return rejectWithValue('Lỗi khi xóa người dùng');
  }
});

// Bulk delete users (admin only)
// export const bulkDeleteUsersThunk = createAsyncThunk('users/bulkDelete', async (
//   { userIds, onSuccess }: { userIds: string[]; onSuccess?: () => void },
//   { rejectWithValue }
// ) => {
//   try {
//     const response = await UsersAPI.bulkDeleteUsers(userIds);
//     if (onSuccess) onSuccess();
//     return { userIds, ...response.data };
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       toast.error(error.response?.data.message);
//       return rejectWithValue(error.response?.data.message);
//     }
//     toast.error('Error bulk deleting users');
//     return rejectWithValue('Error bulk deleting users');
//   }
// });

export const getUserStatisticsThunk = createAsyncThunk('users/statistics', async (id: string, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.getUserStatistics(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi lấy số liệu thống kê người dùng');
    return rejectWithValue('Lỗi khi lấy số liệu thống kê người dùng');
  }
});

export const getWatchListThunk = createAsyncThunk('users/watchList', async (_, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.getWatchList();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tải danh sách theo dõi');
    return rejectWithValue('Lỗi khi tải danh sách theo dõi');
  }
});

export const addToWatchListThunk = createAsyncThunk('users/addToWatchList', async (contentId: string, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.addToWatchList(contentId);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi thêm vào danh sách theo dõi');
    return rejectWithValue('Lỗi khi thêm vào danh sách theo dõi');
  }
});

export const removeFromWatchListThunk = createAsyncThunk('users/removeFromWatchList', async (contentId: string, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.removeFromWatchList(contentId);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi xóa khỏi danh sách theo dõi');
    return rejectWithValue('Lỗi khi xóa khỏi danh sách theo dõi');
  }
});

export const getViewHistoryThunk = createAsyncThunk('users/viewHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await UsersAPI.getViewHistory();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data.message);
      return rejectWithValue(error.response?.data.message);
    }
    toast.error('Lỗi khi tải lịch sử xem');
    return rejectWithValue('Lỗi khi tải lịch sử xem');
  }
});