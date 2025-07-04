// types/api.ts

export interface ScriptSummaryRequest {
  script: string;
  episodeNumber?: number;
  scriptId?: string;
}

export interface ScriptSummaryResponse {
  success: boolean;
  data?: any; // hoặc cụ thể hơn nếu bạn có schema
  error?: string;
  processing_time?: number;
}

export interface FeedbackTrainingRequest {
  feedbacks?: string[];
  useDbFeedbacks?: boolean;
}

export interface TrainingResponse {
  success: boolean;
  feedback_processed?: number;
  improvements?: any;
  training_id?: string;
  error?: string;
}

export interface SummaryFeedbackRequest {
  aiSummaryId: string;
  rating: number;
  feedbackText?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface StatsData {
  total_summaries_generated: number;
  total_feedback_received: number;
  recent_feedback_count: number;
  average_quality_score: number;
  average_user_rating: number;
  total_training_sessions: number;
  last_updated: string;
  ai_version: string;
}

export interface StatsResponse {
  success: boolean;
  data: any;
}
