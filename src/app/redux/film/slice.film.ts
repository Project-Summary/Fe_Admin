import { createSlice } from "@reduxjs/toolkit";
import { IFilmState } from "./interface.film";
import {
    getAllFilmsThunk,
    createFilmThunk,
    getFilmByIdThunk,
    updateFilmThunk,
    deleteFilmThunk,
    createEpisodeThunk,
    getEpisodesWithFilmThunk,
    getEpisodeDetailThunk,
    deleteEpisodeThunk,
    generateEpisodesThunk,
    incrementViewThunk,
    likeFilmThunk,
    rateFilmThunk,
    getPopularMoviesThunk,
    getRecentMoviesThunk,
    getTopRatedMoviesThunk,
    getMaxTopRatedMovieThunk,
} from "./thunk.film";

const initialState: IFilmState = {
    loading: false,
    error: null,
    response: null,
    films: [],
    selectedFilm: null,
    episodes: [],
    selectedEpisode: null,
    popular: [],
    recent: [],
    topRated: [],
    topRatedMovie: null
};

const filmSlice = createSlice({
    name: "film",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        const thunks = [
            getAllFilmsThunk,
            createFilmThunk,
            getFilmByIdThunk,
            updateFilmThunk,
            deleteFilmThunk,
            createEpisodeThunk,
            getEpisodesWithFilmThunk,
            getEpisodeDetailThunk,
            deleteEpisodeThunk,
            generateEpisodesThunk,
            incrementViewThunk,
            likeFilmThunk,
            rateFilmThunk,
            getPopularMoviesThunk,
            getRecentMoviesThunk,
            getTopRatedMoviesThunk,
        ];

        thunks.forEach((thunk) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state.loading = false;
                    state.response = action.payload;
                    state.error = null;

                    switch (thunk) {
                        case getAllFilmsThunk:
                            state.films = action.payload.data.data.data;
                            break;
                        case getFilmByIdThunk:
                            state.selectedFilm = action.payload;
                            break;
                        case getEpisodesWithFilmThunk:
                            state.episodes = action.payload.data.data;
                            break;
                        case getEpisodeDetailThunk:
                            state.selectedEpisode = action.payload;
                            break;
                        case getPopularMoviesThunk:
                            state.popular = action.payload;
                            break;
                        case getRecentMoviesThunk:
                            state.recent = action.payload;
                            break;
                        case getTopRatedMoviesThunk:
                            state.topRated = action.payload;
                            break;
                        case getMaxTopRatedMovieThunk:
                            state.topRatedMovie = action.payload.data.data
                        default:
                            break;
                    }
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string || "Unknown error";
                });
        });
    },
});

export default filmSlice.reducer;