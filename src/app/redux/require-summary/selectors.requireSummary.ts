// app/redux/requireSummary/selectors.requireSummary.ts
import { RootState } from '../store';

// User selectors
export const selectRequireSummaries = (state: RootState) => state.requireSummary.requireSummaries;
export const selectSelectedRequireSummary = (state: RootState) => state.requireSummary.selectedRequireSummary;
export const selectRequireSummaryLoading = (state: RootState) => state.requireSummary.loading;
export const selectRequireSummaryError = (state: RootState) => state.requireSummary.error;
export const selectRequireSummaryPagination = (state: RootState) => state.requireSummary.pagination;

// Admin selectors
export const selectAdminRequireSummaries = (state: RootState) => state.adminRequireSummary.adminRequireSummaries;
export const selectSelectedAdminRequireSummary = (state: RootState) => state.adminRequireSummary.selectedAdminRequireSummary;
export const selectAdminRequireSummaryLoading = (state: RootState) => state.adminRequireSummary.adminLoading;
export const selectAdminRequireSummaryError = (state: RootState) => state.adminRequireSummary.adminError;
export const selectAdminRequireSummaryPagination = (state: RootState) => state.adminRequireSummary.adminPagination;
export const selectAdminRequireSummaryStatistics = (state: RootState) => state.adminRequireSummary.adminStatistics;
