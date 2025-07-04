import { createSlice } from '@reduxjs/toolkit';
import { getAllScriptsThunk, getScriptByMovieThunk, getScriptByIdThunk, createScriptThunk, updateScriptThunk, deleteScriptThunk } from './thunk.script';
import { DataSCript } from '@/interface/script.interface';


interface ScriptState {
  loading: boolean;
  scripts: DataSCript[];
  selectedScript: DataSCript | null;
  error: string | null;
}

const initialState: ScriptState = {
  loading: false,
  scripts: [],
  selectedScript: null,
  error: null
};

const scriptSlice = createSlice({
  name: 'scripts',
  initialState,
  reducers: {
    clearSelectedScript: (state) => {
      state.selectedScript = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all scripts
      .addCase(getAllScriptsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllScriptsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.scripts = action.payload.data.data.data;
      })
      .addCase(getAllScriptsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get script by movie
      .addCase(getScriptByMovieThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScriptByMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.scripts = action.payload.data.data;
      })
      .addCase(getScriptByMovieThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get script by ID
      .addCase(getScriptByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScriptByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedScript = action.payload.data.data;
      })
      .addCase(getScriptByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create script
      .addCase(createScriptThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScriptThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.scripts.unshift(action.payload.data.data);
      })
      .addCase(createScriptThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update script
      .addCase(updateScriptThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateScriptThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data.data;
        const index = state.scripts.findIndex(s => s._id === updated._id);
        if (index !== -1) {
          state.scripts[index] = updated;
        }
      })
      .addCase(updateScriptThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete scripts
      .addCase(deleteScriptThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteScriptThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIds = action.payload.ids;
        state.scripts = state.scripts.filter(script => !deletedIds.includes(script._id));
      })
      .addCase(deleteScriptThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSelectedScript } = scriptSlice.actions;
export default scriptSlice.reducer;
