// app/redux/requireSummary/interface.requireSummary.ts
export interface RequireSummary {
  _id: string;
  userId: string;
//   movieId?: string;
//   storyId?: string;
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

export interface CreateRequireSummaryData {
//   movieId?: string;
//   storyId?: string;
  contentType: 'movie' | 'story';
  title: string;
  description: string;
}

export interface UpdateRequireSummaryData {
  title?: string;
  description?: string;
}
