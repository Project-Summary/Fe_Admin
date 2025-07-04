import API from "../api";
import { CreateStoryData, StoryFilterData, UpdateStoryData } from "./interface.story";

export default class StoryAPI {

    // CRUD Operations
    static createStory(data: CreateStoryData) {
        return API.post('/stories/create', data);
    }

    static getAllStories(filterDto?: StoryFilterData) {
        return API.get('/stories', { params: filterDto });
    }

    static getStoryById(id: string) {
        return API.get(`/stories/${id}`);
    }

    static updateStory(id: string, updateStoryData: UpdateStoryData) {
        return API.patch(`/stories/${id}`, updateStoryData);
    }

    static deleteStory(id: string) {
        return API.delete(`/stories/${id}`);
    }

    static deleteStories(storyIds: string | string[]) {
        return API.delete(`/stories/delete/${storyIds}`);
    }

    // Get Stories by Category and Filters
    static getPopularStories(limit?: number, category?: string) {
        const params: any = {};
        if (limit) params.limit = limit;
        if (category) params.category = category;
        return API.get('/stories/popular', { params });
    }

    static getRecentStories(limit?: number, category?: string) {
        const params: any = {};
        if (limit) params.limit = limit;
        if (category) params.category = category;
        return API.get('/stories/recent', { params });
    }

    static getTopRatedStories(limit?: number, category?: string) {
        const params: any = {};
        if (limit) params.limit = limit;
        if (category) params.category = category;
        return API.get('/stories/top-rated', { params });
    }

    static getStoriesByCategory(categoryId: string, limit?: number, page?: number) {
        const params: any = {};
        if (limit) params.limit = limit;
        if (page) params.page = page;
        return API.get(`/stories/category/${categoryId}`, { params });
    }

    // Summary Operations
    static generateSummary(id: string) {
        return API.post(`/stories/${id}/summary`);
    }

    static getSummary(id: string) {
        return API.get(`/stories/${id}/summary`);
    }

    static updateSummary(id: string, content: string) {
        return API.patch(`/stories/${id}/summary`, { content });
    }

    static deleteSummary(id: string) {
        return API.delete(`/stories/${id}/summary`);
    }

    // Statistics Operations
    static incrementViewCount(id: string) {
        return API.post(`/stories/${id}/view`);
    }

    static likeStory(id: string) {
        return API.post(`/stories/${id}/like`);
    }

    static rateStory(id: string, rating: number) {
        return API.post(`/stories/${id}/rate`, { rating });
    }

    static summaryStory(id: string, script: string) {
        return API.post(`/stories/${id}/summary`, {script});
    }
}