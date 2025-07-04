import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { CreateMovie, CreateEpisode, IDataGenerateEp, UpdateMovieData } from './interface.film';
import FilmAPI from './request.film';

const handleError = (error: unknown, fallbackMessage: string, rejectWithValue: any) => {
  if (error instanceof AxiosError) {
    toast.error(error.response?.data.message);
    return rejectWithValue(error.response?.data.message);
  }
  toast.error(fallbackMessage);
  return rejectWithValue(fallbackMessage);
};

export const getAllFilmsThunk = createAsyncThunk('film/getAll', async (_, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getAllFilms();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải phim', rejectWithValue);
  }
});

export const createFilmThunk = createAsyncThunk('film/create', async (
  { data, onSuccess }: { data: CreateMovie; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.createFilm(data);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tạo phim', rejectWithValue);
  }
});

export const getFilmByIdThunk = createAsyncThunk('film/getById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getFilmById(id);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tìm phim theo ID', rejectWithValue);
  }
});

export const updateFilmThunk = createAsyncThunk('film/update', async (
  { id, data, onSuccess }: { id: string; data: UpdateMovieData; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.updateFilmWithId(id, data);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi cập nhật phim', rejectWithValue);
  }
});

export const deleteFilmThunk = createAsyncThunk('film/delete', async (
  { id, onSuccess }: { id: string; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.deleteFilmWithId(id);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi xóa phim', rejectWithValue);
  }
});

export const createEpisodeThunk = createAsyncThunk('episode/create', async (
  { id, data, onSuccess }: { id: string; data: CreateEpisode; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.createEpisodesWithFilmId(id, data);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tạo tập phim', rejectWithValue);
  }
});

export const getEpisodesWithFilmThunk = createAsyncThunk('episode/getByFilm', async (id: string, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getEpisodesWithIdFilm(id);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải tập phim', rejectWithValue);
  }
});

export const getEpisodeDetailThunk = createAsyncThunk('episode/getDetail', async (
  { epId }: { epId: string },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.getEpisodesWithId(epId);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải chi tiết tập phim', rejectWithValue);
  }
});

export const deleteEpisodeThunk = createAsyncThunk('episode/delete', async (
  { id, epId, onSuccess }: { id: string; epId: string; onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.deleteEpisodesWithId(id, epId);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi xóa tập phim', rejectWithValue);
  }
});

export const generateEpisodesThunk = createAsyncThunk('episode/generate', async (
  { id, data, onSuccess }: { id: string; data: IDataGenerateEp, onSuccess: () => void },
  { rejectWithValue }
) => {
  try {
    const res = await FilmAPI.generateFilmWithIdFilm(id, data);
    onSuccess();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tạo tập phim', rejectWithValue);
  }
});

export const incrementViewThunk = createAsyncThunk('film/incrementView', async (id: string, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.incrementViewIdFilm(id);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tăng chế độ xem', rejectWithValue);
  }
});

export const likeFilmThunk = createAsyncThunk('film/like', async (id: string, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.likeMovieWithIdIFilm(id);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi thích phim', rejectWithValue);
  }
});

export const rateFilmThunk = createAsyncThunk('film/rate', async (id: string, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.rateMovieWithIdFilm(id);
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi đánh giá phim', rejectWithValue);
  }
});

export const getPopularMoviesThunk = createAsyncThunk('film/popular', async (_, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getPopularMovies();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải phim phổ biến', rejectWithValue);
  }
});

export const getRecentMoviesThunk = createAsyncThunk('film/recent', async (_, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getRecentMovies();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải phim gần đây', rejectWithValue);
  }
});

export const getTopRatedMoviesThunk = createAsyncThunk('film/topRated', async (_, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getTopRateMovies();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải danh sách phim được đánh giá cao nhất', rejectWithValue);
  }
});

export const getMaxTopRatedMovieThunk = createAsyncThunk('/film/max/top-rate', async (_, { rejectWithValue }) => {
  try {
    const res = await FilmAPI.getMaxTopRatedMovie();
    return res.data;
  } catch (error) {
    return handleError(error, 'Lỗi khi tải phim được đánh giá cao nhất', rejectWithValue);
  }
})