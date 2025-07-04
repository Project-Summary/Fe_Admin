// app/redux/requireSummary/interface.requireSummary.ts
export interface RequireSummary {
  _id: string;
  userId: string;
  contentType: 'movie' | 'story';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminResponse?: string;
  summaryContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequireSummaryState {
  requireSummaries: RequireSummary[];
  selectedRequireSummary: RequireSummary | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

// Admin interfaces
export interface AdminRequireSummaryState {
  adminRequireSummaries: RequireSummary[];
  selectedAdminRequireSummary: RequireSummary | null;
  adminLoading: boolean;
  adminError: string | null;
  adminPagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  adminStatistics: RequireSummaryStatistics | null;
}

export interface RequireSummaryStatistics {
  total: number;
  statusStats: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  }
  contentTypeStats: {
    movie: number;
    story: number;
  };
  recentRequests: number; // Last 7 days
}

export interface CreateRequireSummaryData {
  contentType: 'movie' | 'story';
  title: string;
  description: string;
}

export interface UpdateRequireSummaryData {
  title?: string;
  description?: string;
}

export interface UpdateRequireSummaryStatusData {
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminResponse?: string;
  summaryContent?: string;
}

export interface GetRequireSummariesQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  contentType?: 'movie' | 'story';
  search?: string;
}
