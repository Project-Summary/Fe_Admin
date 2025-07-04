// File: store/userFilters/userFiltersSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '@/interface/user.interface';

export interface UserFiltersState {
  search: string;
  role: UserRole | "all";
  status: "active" | "inactive" | "all";
  dateFrom?: Date;
  dateTo?: Date;
  lastActive: "today" | "thisWeek" | "thisMonth" | "never" | "all";
  sortBy: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

const initialState: UserFiltersState = {
  search: "",
  role: "all",
  status: "all",
  dateFrom: undefined,
  dateTo: undefined,
  lastActive: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

const userFiltersSlice = createSlice({
  name: 'userFilters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1; // Reset page when search changes
    },
    
    setRole: (state, action: PayloadAction<UserRole | "all">) => {
      state.role = action.payload;
      state.page = 1;
    },
    
    setStatus: (state, action: PayloadAction<"active" | "inactive" | "all">) => {
      state.status = action.payload;
      state.page = 1;
    },
    
    setDateRange: (state, action: PayloadAction<{ from?: Date; to?: Date }>) => {
      state.dateFrom = action.payload.from;
      state.dateTo = action.payload.to;
      state.page = 1;
    },
    
    setLastActive: (state, action: PayloadAction<"today" | "thisWeek" | "thisMonth" | "never" | "all">) => {
      state.lastActive = action.payload;
      state.page = 1;
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy as any;
      state.sortOrder = action.payload.sortOrder;
      state.page = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    
    setFilters: (state, action: PayloadAction<Partial<UserFiltersState>>) => {
      return { ...state, ...action.payload, page: 1 };
    },
    
    resetFilters: (state) => {
      return { ...initialState };
    },
    
    clearSearch: (state) => {
      state.search = "";
      state.page = 1;
    },
    
    clearRole: (state) => {
      state.role = "all";
      state.page = 1;
    },
    
    clearStatus: (state) => {
      state.status = "all";
      state.page = 1;
    },
    
    clearDateRange: (state) => {
      state.dateFrom = undefined;
      state.dateTo = undefined;
      state.page = 1;
    },
    
    clearLastActive: (state) => {
      state.lastActive = "all";
      state.page = 1;
    },
  },
});

export const {
  setSearch,
  setRole,
  setStatus,
  setDateRange,
  setLastActive,
  setSorting,
  setPage,
  setLimit,
  setFilters,
  resetFilters,
  clearSearch,
  clearRole,
  clearStatus,
  clearDateRange,
  clearLastActive,
} = userFiltersSlice.actions;

export default userFiltersSlice.reducer;