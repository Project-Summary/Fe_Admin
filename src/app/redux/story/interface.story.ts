// Enums

import { ContentStatus } from "../film/interface.film";

// Story interfaces - Updated based on DTO and Schema
export interface CreateStoryData {
  title: string;
  description?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  releaseDate?: Date;
  duration?: number;
  categories?: string[];
  ageRating?: string;
  status?: ContentStatus;
  script?: string;
  tags?: string[];
  language?: string;
  country?: string;
}

export interface UpdateStoryData {
  title?: string;
  description?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  releaseDate?: Date;
  duration?: number;
  summary?: string;
  categories?: string[];
  ageRating?: string;
  status?: ContentStatus;
  script?: string;
  tags?: string[];
  language?: string;
  country?: string;
}

export interface StoryFilterData {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ContentStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAllStatuses?: boolean;
  language?: string;
  country?: string;
  ageRating?: string;
}

export interface StoryRating {
  userId: string;
  rating: number;
  createdAt: string;
}

export interface StoryStatistics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Story {
  _id: string;
  title: string;
  description?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  releaseDate?: Date;
  duration?: number;
  categories: StoriesCategories[];
  ageRating?: string;
  status: ContentStatus;
  summary?: StoriesSummary; 
  isAIGenerated: boolean;
  script?: StoriesScript;
  createdBy: string;
  statistics: StoryStatistics;
  ratings: StoryRating[];
  averageRating?: number;
  totalRatings?: number;
  tags?: string[];
  language?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesCategories {
    _id: string, 
    name: string,
    slug: string,
    description: string,
}

export interface StoriesScript {
    _id: string,
    title: string,
    content: string
}

export interface StoriesSummary {
  _id: string,
  content: string,
}

export interface StorySummary {
  _id: string;
  storyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}