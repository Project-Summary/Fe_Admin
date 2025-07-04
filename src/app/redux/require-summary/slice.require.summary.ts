// app/redux/requireSummary/slice.requireSummary.ts (cập nhật)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequireSummaryState, RequireSummary } from './interface.requireSummary';
import { createRequireSummaryThunk, getMyRequireSummariesThunk, getMyStatisticsThunk, updateRequireSummaryThunk, deleteRequireSummariesThunk, getAllRequireSummariesThunk } from './thunk.require-summary';

const initialState: RequireSummaryState = {
  requireSummaries: [],
  selectedRequireSummary: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0
  }
};

const requireSummarySlice = createSlice({
  name: 'requireSummary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRequireSummary: (state, action: PayloadAction<RequireSummary | null>) => {
      state.selectedRequireSummary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create require summary
      .addCase(createRequireSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequireSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.requireSummaries.unshift(action.payload.data.data);
      })
      .addCase(createRequireSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get my require summaries
      .addCase(getMyRequireSummariesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyRequireSummariesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.requireSummaries = action.payload.data.data.data;
        state.pagination = {
          page: action.payload.data.data.page,
          totalPages: action.payload.data.data.totalPages,
          total: action.payload.data.data.total
        };
      })
      .addCase(getMyRequireSummariesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

       .addCase(getAllRequireSummariesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRequireSummariesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.requireSummaries = action.payload.data.data.data;
        state.pagination = {
          page: action.payload.data.data.page,
          totalPages: action.payload.data.data.totalPages,
          total: action.payload.data.data.total
        };
      })
      .addCase(getAllRequireSummariesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get my statistics
      .addCase(getMyStatisticsThunk.fulfilled, (state, action) => {
        // Handle statistics if needed in user state
      })

      // Update require summary
      .addCase(updateRequireSummaryThunk.fulfilled, (state, action) => {
        const index = state.requireSummaries.findIndex(rs => rs._id === action.payload.data._id);
        if (index !== -1) {
          state.requireSummaries[index] = action.payload.data;
        }
      })

      // Delete require summaries
      .addCase(deleteRequireSummariesThunk.fulfilled, (state, action) => {
        const deletedIds = action.meta.arg;
        state.requireSummaries = state.requireSummaries.filter(rs => !deletedIds.includes(rs._id));
      });
  }
});

export const { clearError, setSelectedRequireSummary } = requireSummarySlice.actions;
export default requireSummarySlice.reducer;
