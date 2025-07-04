import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/slice.auth';
import filmReducer from './film/slice.film';
import usersReducer from './users/slice.users';
import userFiltersReducer from './userFilters/userFiltersSlice';
import categoriesReducer from './categories/slice.categories';
import scriptReducer from './script/slice.script';
import storyReducer from './story/slice.story';
import feedbackReducer from './feedback/slice.feedback';
import adminRequireSummaryReducer from './require-summary/slice.adminRequireSummary';
import requireSummaryReducer from './require-summary/slice.require.summary';
import aiModelSliceReducer from './ai-model/slice.ai-model';

const rootReducer = combineReducers({
    auth: authReducer,
    film: filmReducer,
    users: usersReducer,
    userFilters: userFiltersReducer,
    categories: categoriesReducer,
    script: scriptReducer,
    story: storyReducer,
    feedback: feedbackReducer,
    adminRequireSummary: adminRequireSummaryReducer,
    requireSummary: requireSummaryReducer,
    aiModel: aiModelSliceReducer,
});
// Cấu hình store
export const store = configureStore({
    //Sử dụng persistedReducer
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for date handling
                ignoredActions: [
                    'userFilters/setDateRange',
                    'userFilters/setFilters',
                ],
                // Ignore these field paths in all actions
                ignoredActionsPaths: ['payload.dateFrom', 'payload.dateTo'],
                // Ignore these paths in the state
                ignoredPaths: ['userFilters.dateFrom', 'userFilters.dateTo'],
            },
        }),
});
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
