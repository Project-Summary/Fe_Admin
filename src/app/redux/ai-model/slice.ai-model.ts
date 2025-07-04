// File: app/redux/ai-model/slice.ai-model.ts
import { createSlice } from '@reduxjs/toolkit';
import { fetchAllSummarize, fetchStats } from './request.ai-model';

interface AIModelState {
  summaries: any[];
  stats: any;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: AIModelState = {
  summaries: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
};

const aiModelSlice = createSlice({
  name: 'aiModel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSummarize.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSummarize.fulfilled, (state, action) => {
        state.loading = false;
        state.summaries = action.payload.data;
      })
      .addCase(fetchAllSummarize.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      });
  },
});


export const { clearError } = aiModelSlice.actions;
export default aiModelSlice.reducer;
