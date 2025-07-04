// app/redux/requireSummary/adminRequireSummary.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminRequireSummaryState, RequireSummary } from './interface.requireSummary';
import { getAllRequireSummariesThunk, getAllRequireSummariesStatsThunk, getSummaryByIdThunk, updateRequireSummaryStatusThunk, deleteAdminRequireSummariesThunk } from './thunk.require-summary';


const initialState: AdminRequireSummaryState = {
  adminRequireSummaries: [],
  selectedAdminRequireSummary: null,
  adminLoading: false,
  adminError: null,
  adminPagination: {
    page: 1,
    totalPages: 1,
    total: 0
  },
  adminStatistics: null
};

const adminRequireSummarySlice = createSlice({
  name: 'adminRequireSummary',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.adminError = null;
    },
    setSelectedAdminRequireSummary: (state, action: PayloadAction<RequireSummary | null>) => {
      state.selectedAdminRequireSummary = action.payload;
    },
    resetAdminRequireSummaryState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all require summaries (admin)
      .addCase(getAllRequireSummariesThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getAllRequireSummariesThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminRequireSummaries = action.payload.data.data.data;
        state.adminPagination = {
          page: action.payload.data.data.page,
          totalPages: action.payload.data.data.totalPages,
          total: action.payload.data.data.total
        };
      })
      .addCase(getAllRequireSummariesThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      // Get admin statistics
      .addCase(getAllRequireSummariesStatsThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getAllRequireSummariesStatsThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminStatistics = action.payload.data.data.data;
      })
      .addCase(getAllRequireSummariesStatsThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      // Get summary by ID
      .addCase(getSummaryByIdThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getSummaryByIdThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.selectedAdminRequireSummary = action.payload.data.data;
      })
      .addCase(getSummaryByIdThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      // Update require summary status
      .addCase(updateRequireSummaryStatusThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(updateRequireSummaryStatusThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        const index = state.adminRequireSummaries.findIndex(rs => rs._id === action.payload.data._id);
        if (index !== -1) {
          state.adminRequireSummaries[index] = action.payload.data;
        }
        if (state.selectedAdminRequireSummary?._id === action.payload.data._id) {
          state.selectedAdminRequireSummary = action.payload.data;
        }
      })
      .addCase(updateRequireSummaryStatusThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      })

      // Delete admin require summaries
      .addCase(deleteAdminRequireSummariesThunk.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(deleteAdminRequireSummariesThunk.fulfilled, (state, action) => {
        state.adminLoading = false;
        const deletedIds = action.meta.arg;
        state.adminRequireSummaries = state.adminRequireSummaries.filter(rs => !deletedIds.includes(rs._id));
        // Update pagination total
        state.adminPagination.total -= deletedIds.length;
      })
      .addCase(deleteAdminRequireSummariesThunk.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload as string;
      });
  }
});

export const { 
  clearAdminError, 
  setSelectedAdminRequireSummary, 
  resetAdminRequireSummaryState 
} = adminRequireSummarySlice.actions;

export default adminRequireSummarySlice.reducer;
