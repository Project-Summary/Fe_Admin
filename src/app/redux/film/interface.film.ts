// File: app/redux/film/interface.film.ts
import { StoriesCategories } from "../story/interface.story";

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

export interface Credits {
    director?: string;
    writer?: string;
    cast?: string[];
    producer?: string;
    studio?: string;
}

export interface UpdateMovieData {
  title?: string;
  description?: string;
  script?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  releaseDate?: Date;
  duration?: number;
  categories?: string[];
  ageRating?: string;
  status?: ContentStatus;
  tags?: string[];
  language?: string;
  country?: string;
  directors?: string[];
  actors?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isAIGenerated?: boolean;
}

export interface CreateMovie {
    title: string;
    description?: string;
    poster?: string;
    backdrop?: string;
    trailer?: string;
    releaseDate?: Date;
    duration?: number;
    categories: string[];
    ageRating?: string;
    status?: ContentStatus;
    isAIGenerated?: boolean;
    script?: string;
    tags?: string[];
    language?: string;
    country?: string;
    credits?: Credits;
}

export interface Subtitle {
    language: string;
    url: string;
}

export interface CreateEpisode {
    title: string;
    description?: string;
    thumbnail?: string;
    videoUrl?: string;
    duration?: number;
    episodeNumber: number;
    seasonNumber?: number;
    status?: ContentStatus;
    isAIGenerated?: boolean;
    transcript?: string;
    subtitles?: Subtitle[];
}

// New Episode interface matching the schema
export interface IEpisode {
    _id: string;
    movieId: string;
    title: string;
    description?: string;
    thumbnail?: string;
    videoUrl?: string;
    duration: number;
    episodeNumber: number;
    seasonNumber?: number;
    status: ContentStatus;
    isAIGenerated: boolean;
    statistics: IStatistics;
    transcript?: string;
    subtitles?: Subtitle[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface IDataGenerateEp {
    script: string,
    episodeCount?: number,
}

export interface IFilmState {
    loading: boolean,
    error: string | null,
    response: any | null,
    films: IMappingMovie[],
    selectedFilm: any | null,
    episodes: IEpisode[],
    selectedEpisode: IEpisode | null,
    popular: any[],
    recent: any[],
    topRated: any[],
    topRatedMovie: IMappingMovie | null,
}

export interface IMappingMovie {
    _id: string,
    title: string,
    poster: string,
    totalEpisodes: number,
    statistics: IStatistics,
    categories: StoriesCategories[];
    status: string;
    isAIGenerated: boolean;
    createdAt: string;
    updatedAt: string;
    releaseDate: string;
    description: string;
    script: string;
    averageRating: number;
    episodes: string[]
}

export interface IStatistics {
    views: number;
    likes: number;
    comments: number;
    shares: number;
}

// New interface for episode with movie info
export interface IEpisodeWithMovie extends IEpisode {
    movieTitle: string;
    moviePoster: string;
}
