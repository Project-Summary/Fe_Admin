import { createSlice } from "@reduxjs/toolkit";

import { Categories } from "@/interface/categories.interface";
import { createCategoryThunk, deleteCategoryThunk, getCategoriesThunk, updateCategoryThunk } from "./thunk.categories";

interface CategoriesState {
    categories: Categories[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoriesState = {
    categories: [],
    loading: false,
    error: null,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Get
        builder.addCase(getCategoriesThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getCategoriesThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.categories = action.payload.data.data;
        });
        builder.addCase(getCategoriesThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create
        builder.addCase(createCategoryThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.categories.push(action.payload.data.data);
        });
        builder.addCase(createCategoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update
        builder.addCase(updateCategoryThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            const updated = action.payload.data.data;
            state.categories = state.categories.map((category) =>
                category._id === updated._id ? updated : category
            );
        });
        builder.addCase(updateCategoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Delete
        builder.addCase(deleteCategoryThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteCategoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            const deletedId = action.meta.arg.id;
            state.categories = state.categories.filter((cat) => cat._id !== deletedId);
        });
        builder.addCase(deleteCategoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export default categoriesSlice.reducer;
