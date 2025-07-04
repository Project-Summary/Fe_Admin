// @/interface/feedback.interface.ts
export interface CreateFeedbackData {
  movieId?: string;
  storyId?: string;
  content: string;
  rate: number;
}

export interface UpdateFeedbackData {
  content?: string;
  rate?: number;
}

export interface QueryFeedbackParams {
  movieId?: string;
  storyId?: string;
  userId?: string;
  minRate?: number;
  maxRate?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FeedbackUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FeedbackContent {
  _id: string;
  title: string;
  poster?: string;
}

export interface Feedback {
  _id: string;
  userId: FeedbackUser;
  movieId?: FeedbackContent;
  storyId?: FeedbackContent;
  content: string;
  rate: number;
  isVisible: boolean;
  isFlagged: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationAction?: 'approve' | 'reject' | 'flag';
  moderationNote?: string;
  helpfulCount: number;
  helpfulVotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FeedbackListResponse {
  data: Feedback[];
  pagination: FeedbackPagination;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ContentFeedbackResponse {
  data: Feedback[];
  stats: FeedbackStats;
  pagination: FeedbackPagination;
}

export interface OverallFeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentFeedbacks: number;
  topRatedContent: Array<{
    contentId: string;
    contentType: 'movie' | 'story';
    title: string;
    averageRating: number;
    totalFeedbacks: number;
  }>;
}

export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}
