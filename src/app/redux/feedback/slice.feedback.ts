// store/feedback/slice.feedback.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Feedback,
  FeedbackListResponse,
  ContentFeedbackResponse,
  OverallFeedbackStats,
  FeedbackPagination,
  FeedbackStats,
} from '@/interface/feedback.interface';
import {
  createFeedbackThunk,
  getAllFeedbacksThunk,
  getFeedbackStatsThunk,
  getFeedbackByContentThunk,
  getMyFeedbacksThunk,
  getFeedbackByIdThunk,
  updateFeedbackThunk,
  deleteFeedbackThunk,
  deleteBulkFeedbacksThunk,
  moderateFeedbackThunk,
} from './thunk.feedback';

interface FeedbackState {
  // Lists
  feedbacks: Feedback[];
  myFeedbacks: Feedback[];
  contentFeedbacks: Feedback[];
  
  // Single feedback
  currentFeedback: Feedback | null;
  
  // Statistics
  overallStats: OverallFeedbackStats | null;
  contentStats: FeedbackStats | null;
  
  // Pagination
  pagination: FeedbackPagination | null;
  myFeedbacksPagination: FeedbackPagination | null;
  contentFeedbacksPagination: FeedbackPagination | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isModerating: boolean;
  isLoadingStats: boolean;
  isLoadingContent: boolean;
  isLoadingMy: boolean;
  
  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  moderateError: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  myFeedbacks: [],
  contentFeedbacks: [],
  currentFeedback: null,
  overallStats: null,
  contentStats: null,
  pagination: null,
  myFeedbacksPagination: null,
  contentFeedbacksPagination: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isModerating: false,
  isLoadingStats: false,
  isLoadingContent: false,
  isLoadingMy: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  moderateError: null,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.moderateError = null;
    },
    clearCurrentFeedback: (state) => {
      state.currentFeedback = null;
    },
    clearContentFeedbacks: (state) => {
      state.contentFeedbacks = [];
      state.contentStats = null;
      state.contentFeedbacksPagination = null;
    },
    clearMyFeedbacks: (state) => {
      state.myFeedbacks = [];
      state.myFeedbacksPagination = null;
    },
    resetFeedbackState: () => initialState,
  },
  extraReducers: (builder) => {
    // Create feedback
    builder
      .addCase(createFeedbackThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createFeedbackThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.feedbacks.unshift(action.payload.data.data);
        state.myFeedbacks.unshift(action.payload.data.data);
      })
      .addCase(createFeedbackThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });

    // Get all feedbacks
    builder
      .addCase(getAllFeedbacksThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllFeedbacksThunk.fulfilled, (state, action) => {
        console.log("Action payload: ", action.payload.data.data.data);
        console.log("Action payload: ", action.payload.data.data.pagination);
        state.isLoading = false;
        state.feedbacks = action.payload.data.data.data;
        state.pagination = action.payload.data.data.pagination;
      })
      .addCase(getAllFeedbacksThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get feedback stats
    builder
      .addCase(getFeedbackStatsThunk.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(getFeedbackStatsThunk.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.overallStats = action.payload.data.data;
      })
      .addCase(getFeedbackStatsThunk.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload as string;
      });

    // Get feedback by content
    builder
      .addCase(getFeedbackByContentThunk.pending, (state) => {
        state.isLoadingContent = true;
        state.error = null;
      })
      .addCase(getFeedbackByContentThunk.fulfilled, (state, action) => {
        state.isLoadingContent = false;
        state.contentFeedbacks = action.payload.data;
        state.contentStats = action.payload.stats;
        state.contentFeedbacksPagination = action.payload.pagination;
      })
      .addCase(getFeedbackByContentThunk.rejected, (state, action) => {
        state.isLoadingContent = false;
        state.error = action.payload as string;
      });

    // Get my feedbacks
    builder
      .addCase(getMyFeedbacksThunk.pending, (state) => {
        state.isLoadingMy = true;
        state.error = null;
      })
      .addCase(getMyFeedbacksThunk.fulfilled, (state, action) => {
        state.isLoadingMy = false;
        state.myFeedbacks = action.payload.data;
        state.myFeedbacksPagination = action.payload.pagination;
      })
      .addCase(getMyFeedbacksThunk.rejected, (state, action) => {
        state.isLoadingMy = false;
        state.error = action.payload as string;
      });

    // Get feedback by ID
    builder
      .addCase(getFeedbackByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeedbackByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload.data.data;
      })
      .addCase(getFeedbackByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update feedback
    builder
      .addCase(updateFeedbackThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateFeedbackThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedFeedback = action.payload;
        
        // Update in all relevant arrays
        const updateFeedbackInArray = (array: Feedback[]) => {
          const index = array.findIndex(f => f._id === updatedFeedback._id);
          if (index !== -1) {
            array[index] = updatedFeedback;
          }
        };
        
        updateFeedbackInArray(state.feedbacks);
        updateFeedbackInArray(state.myFeedbacks);
        updateFeedbackInArray(state.contentFeedbacks);
        
        if (state.currentFeedback?._id === updatedFeedback._id) {
          state.currentFeedback = updatedFeedback;
        }
      })
      .addCase(updateFeedbackThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });

    // Delete feedback
    builder
      .addCase(deleteFeedbackThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteFeedbackThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload.id;
        
        // Remove from all arrays
        state.feedbacks = state.feedbacks.filter(f => f._id !== deletedId);
        state.myFeedbacks = state.myFeedbacks.filter(f => f._id !== deletedId);
        state.contentFeedbacks = state.contentFeedbacks.filter(f => f._id !== deletedId);
        
        if (state.currentFeedback?._id === deletedId) {
          state.currentFeedback = null;
        }
      })
      .addCase(deleteFeedbackThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });

    // Bulk delete feedbacks
    builder
      .addCase(deleteBulkFeedbacksThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteBulkFeedbacksThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedIds = action.payload.feedbackIds;
        
        // Remove from all arrays
        state.feedbacks = state.feedbacks.filter(f => !deletedIds.includes(f._id));
        state.myFeedbacks = state.myFeedbacks.filter(f => !deletedIds.includes(f._id));
        state.contentFeedbacks = state.contentFeedbacks.filter(f => !deletedIds.includes(f._id));
      })
      .addCase(deleteBulkFeedbacksThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });

    // Moderate feedback
    builder
      .addCase(moderateFeedbackThunk.pending, (state) => {
        state.isModerating = true;
        state.moderateError = null;
      })
      .addCase(moderateFeedbackThunk.fulfilled, (state, action) => {
        state.isModerating = false;
        const moderatedFeedback = action.payload;
        
        // Update in all relevant arrays
        const updateFeedbackInArray = (array: Feedback[]) => {
          const index = array.findIndex(f => f._id === moderatedFeedback._id);
          if (index !== -1) {
            array[index] = moderatedFeedback;
          }
        };
        
        updateFeedbackInArray(state.feedbacks);
        updateFeedbackInArray(state.contentFeedbacks);
        
        if (state.currentFeedback?._id === moderatedFeedback._id) {
          state.currentFeedback = moderatedFeedback;
        }
      })
      .addCase(moderateFeedbackThunk.rejected, (state, action) => {
        state.isModerating = false;
        state.moderateError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearCurrentFeedback,
  clearContentFeedbacks,
  clearMyFeedbacks,
  resetFeedbackState,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;
