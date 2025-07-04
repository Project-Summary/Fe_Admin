import { createAsyncThunk } from "@reduxjs/toolkit";
import { CategoryDto } from "@/interface/categories.interface";
import { AxiosError } from "axios";
import { toast } from "sonner";
import CategoriesAPI from "./request.categories";

// Get all categories
export const getCategoriesThunk = createAsyncThunk(
  'categories/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoriesAPI.getCategories();
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return rejectWithValue(error.response?.data.message);
      }

      toast.error("Lỗi khi tìm nạp danh mục");
      return rejectWithValue("Lỗi khi tìm nạp danh mục");
    }
  }
);

// Create category
export const createCategoryThunk = createAsyncThunk(
  'categories/create',
  async (
    { data, onSuccess }: { data: CategoryDto; onSuccess: () => void },
    { rejectWithValue }
  ) => {
    try {
      const response = await CategoriesAPI.createCategory(data);
      onSuccess();
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return rejectWithValue(error.response?.data.message);
      }

      toast.error("Lỗi khi tạo danh mục");
      return rejectWithValue("Lỗi khi tạo danh mục");
    }
  }
);

// Update category
export const updateCategoryThunk = createAsyncThunk(
  'categories/update',
  async (
    {
      id,
      data,
      onSuccess,
    }: { id: string; data: CategoryDto; onSuccess: () => void },
    { rejectWithValue }
  ) => {
    try {
      const response = await CategoriesAPI.updateCategories(id, data);
      onSuccess();
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return rejectWithValue(error.response?.data.message);
      }

      toast.error("Lỗi khi cập nhật danh mục");
      return rejectWithValue("Lỗi khi cập nhật danh mục");
    }
  }
);

// Delete category
export const deleteCategoryThunk = createAsyncThunk(
  'categories/delete',
  async (
    { id, onSuccess }: { id: string; onSuccess: () => void },
    { rejectWithValue }
  ) => {
    try {
      const response = await CategoriesAPI.deleteCategories(id);
      onSuccess();
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return rejectWithValue(error.response?.data.message);
      }

      toast.error("Lỗi khi xóa danh mục");
      return rejectWithValue("Lỗi khi xóa danh mục");
    }
  }
);
