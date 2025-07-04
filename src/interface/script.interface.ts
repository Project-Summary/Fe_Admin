import { IMappingMovie } from "@/app/redux/film/interface.film";

export interface CreateScriptData {
    title: string,
    description: string,
    content: string,
    type: string,
}

export interface UpdateScriptData {
    title?: string; description?: string; content?: string; type?: string
}

export interface DataSCript {
    movieId: IMappingMovie
    _id: string;
    title: string;
    description: string,
    content: string,
    type: string,
    createdAt: Date,
    updatedAt: Date,
}