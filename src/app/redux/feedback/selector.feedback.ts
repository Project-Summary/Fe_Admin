// store/feedback/selectors.feedback.ts
import { RootState } from '../store';

export const selectFeedbacks = (state: RootState) => state.feedback.feedbacks;
export const selectMyFeedbacks = (state: RootState) => state.feedback.myFeedbacks;
export const selectContentFeedbacks = (state: RootState) => state.feedback.contentFeedbacks;
export const selectCurrentFeedback = (state: RootState) => state.feedback.currentFeedback;
export const selectOverallStats = (state: RootState) => state.feedback.overallStats;
export const selectContentStats = (state: RootState) => state.feedback.contentStats;
export const selectFeedbackPagination = (state: RootState) => state.feedback.pagination;
export const selectMyFeedbacksPagination = (state: RootState) => state.feedback.myFeedbacksPagination;
export const selectContentFeedbacksPagination = (state: RootState) => state.feedback.contentFeedbacksPagination;

// Loading states
export const selectFeedbackLoading = (state: RootState) => state.feedback.isLoading;
export const selectFeedbackCreating = (state: RootState) => state.feedback.isCreating;
export const selectFeedbackUpdating = (state: RootState) => state.feedback.isUpdating;
export const selectFeedbackDeleting = (state: RootState) => state.feedback.isDeleting;
export const selectFeedbackModerating = (state: RootState) => state.feedback.isModerating;
export const selectFeedbackStatsLoading = (state: RootState) => state.feedback.isLoadingStats;
export const selectFeedbackContentLoading = (state: RootState) => state.feedback.isLoadingContent;
export const selectFeedbackMyLoading = (state: RootState) => state.feedback.isLoadingMy;

// Error states
export const selectFeedbackError = (state: RootState) => state.feedback.error;
export const selectFeedbackCreateError = (state: RootState) => state.feedback.createError;
export const selectFeedbackUpdateError = (state: RootState) => state.feedback.updateError;
export const selectFeedbackDeleteError = (state: RootState) => state.feedback.deleteError;
export const selectFeedbackModerateError = (state: RootState) => state.feedback.moderateError;
