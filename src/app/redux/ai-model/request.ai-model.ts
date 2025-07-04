// api/apiRequests.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
    ScriptSummaryRequest,
    ScriptSummaryResponse,
    FeedbackTrainingRequest,
    TrainingResponse,
    SummaryFeedbackRequest,
    FeedbackResponse,
    StatsResponse
} from "./interface.ai-model";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:7000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

export const fetchSummarize = createAsyncThunk<ScriptSummaryResponse, ScriptSummaryRequest>(
    'api/fetchSummarize',
    async (payload) => {
        const res = await axiosInstance.post('/api/summarize', payload);
        return res.data;
    }
);

export const fetchTrain = createAsyncThunk<TrainingResponse, FeedbackTrainingRequest>(
    'api/fetchTrain',
    async (payload) => {
        const res = await axiosInstance.post<TrainingResponse>('/api/train', payload);
        return res.data;
    }
);

export const sendFeedback = createAsyncThunk<FeedbackResponse, SummaryFeedbackRequest>(
    'api/sendFeedback',
    async (payload) => {
        const res = await axiosInstance.post<FeedbackResponse>('/api/feedback', payload);
        return res.data;
    }
);

export const fetchStats = createAsyncThunk<StatsResponse>(
    'api/fetchStats',
    async () => {
        const res = await axiosInstance.get<StatsResponse>('/api/stats');
        return res.data;
    }
);

export const fetchAllSummarize = createAsyncThunk(
    'ai/fetchSummarize',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/summaries');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);