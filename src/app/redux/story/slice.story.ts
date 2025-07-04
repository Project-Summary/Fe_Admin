// Story Slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Story } from './interface.story';
import { createStoryThunk, getAllStoriesThunk, getStoryByIdThunk, updateStoryThunk, deleteStoryThunk, deleteStoriesThunk, getPopularStoriesThunk, getRecentStoriesThunk, getTopRatedStoriesThunk, getStoriesByCategoryThunk, generateSummaryThunk, getSummaryThunk, updateSummaryThunk, deleteSummaryThunk, incrementViewCountThunk, likeStoryThunk, rateStoryThunk } from './thunk.story';

interface Summary {
    id: string;
    storyId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface StoryState {
    // Story lists
    stories: Story[];
    popularStories: Story[];
    recentStories: Story[];
    topRatedStories: Story[];
    storiesByCategory: Story[];

    // Single story
    currentStory: Story | null;

    // Summary
    currentSummary: Summary | null;

    // Loading states
    loading: boolean;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    summaryLoading: boolean;

    // Error states
    error: string | null;

    // Pagination and filters
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

const initialState: StoryState = {
    stories: [],
    popularStories: [],
    recentStories: [],
    topRatedStories: [],
    storiesByCategory: [],
    currentStory: null,
    currentSummary: null,
    loading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    summaryLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
};

const storySlice = createSlice({
    name: 'stories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentStory: (state) => {
            state.currentStory = null;
        },
        clearCurrentSummary: (state) => {
            state.currentSummary = null;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        updateStoryInList: (state, action: PayloadAction<Story>) => {
            const updatedStory = action.payload;

            // Update in main stories list
            const storyIndex = state.stories.findIndex(story => story._id === updatedStory._id);
            if (storyIndex !== -1) {
                state.stories[storyIndex] = updatedStory;
            }

            // Update in other lists if present
            const popularIndex = state.popularStories.findIndex(story => story._id === updatedStory._id);
            if (popularIndex !== -1) {
                state.popularStories[popularIndex] = updatedStory;
            }

            const recentIndex = state.recentStories.findIndex(story => story._id === updatedStory._id);
            if (recentIndex !== -1) {
                state.recentStories[recentIndex] = updatedStory;
            }

            const topRatedIndex = state.topRatedStories.findIndex(story => story._id === updatedStory._id);
            if (topRatedIndex !== -1) {
                state.topRatedStories[topRatedIndex] = updatedStory;
            }

            const categoryIndex = state.storiesByCategory.findIndex(story => story._id === updatedStory._id);
            if (categoryIndex !== -1) {
                state.storiesByCategory[categoryIndex] = updatedStory;
            }

            // Update current story if it's the same
            if (state.currentStory && state.currentStory._id === updatedStory._id) {
                state.currentStory = updatedStory;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Story
            .addCase(createStoryThunk.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createStoryThunk.fulfilled, (state, action) => {
                state.createLoading = false;
                state.stories.unshift(action.payload.data.data.data);
            })
            .addCase(createStoryThunk.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload as string;
            })

            // Get All Stories
            .addCase(getAllStoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllStoriesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload.data.data.data;
                state.totalCount = action.payload.data.data.data.totalCount || action.payload.data.data.data.length;
                state.totalPages = action.payload.data.data.data.totalPages || 1;
            })
            .addCase(getAllStoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Story By ID
            .addCase(getStoryByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStoryByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentStory = action.payload.data.data.data;
            })
            .addCase(getStoryByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update Story
            .addCase(updateStoryThunk.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateStoryThunk.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedStory = action.payload.data.data.data;

                // Update in stories list
                const index = state.stories.findIndex(story => story._id === updatedStory._id);
                if (index !== -1) {
                    state.stories[index] = updatedStory;
                }

                // Update current story if it's the same
                if (state.currentStory && state.currentStory._id === updatedStory._id) {
                    state.currentStory = updatedStory;
                }
            })
            .addCase(updateStoryThunk.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload as string;
            })

            // Delete Story
            .addCase(deleteStoryThunk.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteStoryThunk.fulfilled, (state, action) => {
                state.deleteLoading = false;
                // Remove from stories list (assuming the payload contains the deleted story ID)
                const deletedId = action.payload.data.data.data._id;
                state.stories = state.stories.filter(story => story._id !== deletedId);

                // Clear current story if it was deleted
                if (state.currentStory && state.currentStory._id === deletedId) {
                    state.currentStory = null;
                }
            })
            .addCase(deleteStoryThunk.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload as string;
            })

            // Delete Multiple Stories
            .addCase(deleteStoriesThunk.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteStoriesThunk.fulfilled, (state, action) => {
                state.deleteLoading = false;
                const deletedIds = action.meta.arg.storyIds;
                const idsArray = Array.isArray(deletedIds) ? deletedIds : [deletedIds];
                state.stories = state.stories.filter(story => !idsArray.includes(story._id));

                // Clear current story if it was deleted
                if (state.currentStory && idsArray.includes(state.currentStory._id)) {
                    state.currentStory = null;
                }
            })
            .addCase(deleteStoriesThunk.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload as string;
            })

            // Get Popular Stories
            .addCase(getPopularStoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPopularStoriesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.popularStories = action.payload.data.data.data;
            })
            .addCase(getPopularStoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Recent Stories
            .addCase(getRecentStoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRecentStoriesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.recentStories = action.payload.data.data.data;
            })
            .addCase(getRecentStoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Top Rated Stories
            .addCase(getTopRatedStoriesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTopRatedStoriesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.topRatedStories = action.payload.data.data.data;
            })
            .addCase(getTopRatedStoriesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Stories By Category
            .addCase(getStoriesByCategoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStoriesByCategoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.storiesByCategory = action.payload.data.data.data;
            })
            .addCase(getStoriesByCategoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Generate Summary
            .addCase(generateSummaryThunk.pending, (state) => {
                state.summaryLoading = true;
                state.error = null;
            })
            .addCase(generateSummaryThunk.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.currentSummary = action.payload.data.data.data;
            })
            .addCase(generateSummaryThunk.rejected, (state, action) => {
                state.summaryLoading = false;
                state.error = action.payload as string;
            })

            // Get Summary
            .addCase(getSummaryThunk.pending, (state) => {
                state.summaryLoading = true;
                state.error = null;
            })
            .addCase(getSummaryThunk.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.currentSummary = action.payload.data.data.data;
            })
            .addCase(getSummaryThunk.rejected, (state, action) => {
                state.summaryLoading = false;
                state.error = action.payload as string;
            })

            // Update Summary
            .addCase(updateSummaryThunk.pending, (state) => {
                state.summaryLoading = true;
                state.error = null;
            })
            .addCase(updateSummaryThunk.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.currentSummary = action.payload.data.data.data;
            })
            .addCase(updateSummaryThunk.rejected, (state, action) => {
                state.summaryLoading = false;
                state.error = action.payload as string;
            })

            // Delete Summary
            .addCase(deleteSummaryThunk.pending, (state) => {
                state.summaryLoading = true;
                state.error = null;
            })
            .addCase(deleteSummaryThunk.fulfilled, (state) => {
                state.summaryLoading = false;
                state.currentSummary = null;
            })
            .addCase(deleteSummaryThunk.rejected, (state, action) => {
                state.summaryLoading = false;
                state.error = action.payload as string;
            })

            // Increment View Count
            .addCase(incrementViewCountThunk.fulfilled, (state, action) => {
                // Update view count in current story and lists
                const updatedStory = action.payload.data.data.data;
                if (updatedStory && updatedStory._id) {
                    const updateViewCount = (stories: Story[]) => {
                        const index = stories.findIndex(story => story._id === updatedStory._id);
                        if (index !== -1) {
                            stories[index].statistics.views = updatedStory.viewCount || stories[index].statistics.views + 1;
                        }
                    };

                    updateViewCount(state.stories);
                    updateViewCount(state.popularStories);
                    updateViewCount(state.recentStories);
                    updateViewCount(state.topRatedStories);
                    updateViewCount(state.storiesByCategory);

                    if (state.currentStory && state.currentStory._id === updatedStory._id) {
                        state.currentStory.statistics.views = updatedStory.viewCount || state.currentStory.statistics.views + 1;
                    }
                }
            })

            // Like Story
            .addCase(likeStoryThunk.fulfilled, (state, action) => {
                // Similar to view count, update likes
                const updatedStory = action.payload.data.data.data;
                if (updatedStory && updatedStory._id) {
                    const updateLikes = (stories: Story[]) => {
                        const index = stories.findIndex(story => story._id === updatedStory._id);
                        if (index !== -1) {
                            stories[index].statistics.likes = updatedStory.likes || stories[index].statistics.likes + 1;
                        }
                    };

                    updateLikes(state.stories);
                    updateLikes(state.popularStories);
                    updateLikes(state.recentStories);
                    updateLikes(state.topRatedStories);
                    updateLikes(state.storiesByCategory);

                    if (state.currentStory && state.currentStory._id === updatedStory._id) {
                        state.currentStory.statistics.likes = updatedStory.likes || state.currentStory.statistics.likes + 1;
                    }
                }
            })

        // // Rate Story
        // .addCase(rateStoryThunk.fulfilled, (state, action) => {
        //     // Update rating
        //     const updatedStory = action.payload;
        //     if (updatedStory && updatedStory._id) {
        //         const updateRating = (stories: Story[]) => {
        //             const index = stories.findIndex(story => story._id === updatedStory._id);
        //             if (index !== -1) {
        //                 stories[index].ratings.rating = updatedStory.rating;
        //             }
        //         };

        //         updateRating(state.stories);
        //         updateRating(state.popularStories);
        //         updateRating(state.recentStories);
        //         updateRating(state.topRatedStories);
        //         updateRating(state.storiesByCategory);

        //         if (state.currentStory && state.currentStory._id === updatedStory._id) {
        //             state.currentStory.ratings.rating = updatedStory.rating;
        //         }
        //     }
        // });
    },
});

export const {
    clearError,
    clearCurrentStory,
    clearCurrentSummary,
    setCurrentPage,
    updateStoryInList,
} = storySlice.actions;

export default storySlice.reducer;
