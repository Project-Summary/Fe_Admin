import API from "../api";
import { CreateEpisode, CreateMovie, IDataGenerateEp, UpdateMovieData } from "./interface.film";

export default class FilmAPI {
    static getAllFilms() {
        return API.get('/film');
    }

    static createFilm(data: CreateMovie) {
        return API.post('/film/create', data);
    }

    static getFilmById(id: string) {
        return API.get(`/film/${id}`);
    }

    static updateFilmWithId(id: string, data: UpdateMovieData) {
        return API.patch(`/film/${id}`, data);
    }

    static deleteFilmWithId(id: string) {
        return API.delete(`/film/${id}`);
    }

    static createEpisodesWithFilmId(id: string, data: CreateEpisode) {
        return API.post(`/film/${id}/episodes`, data);
    }

    static getEpisodesWithIdFilm(id: string) {
        return API.get(`/film/${id}/episodes`)
    }

    static getEpisodesWithId(epId: string) {
        return API.get(`/film/episodes/${epId}`);
    }

    static deleteEpisodesWithId(id: string, epId: string) {
        return API.delete(`/film/${id}/episodes/${epId}`);
    }

    static generateFilmWithIdFilm (id: string, data: IDataGenerateEp) {
        return API.post(`/film/${id}/generate-episodes`, data);
    }

    static incrementViewIdFilm (id: string) {
        return API.post(`/film/${id}/view`);
    }
    
    static likeMovieWithIdIFilm(id: string) {
        return API.post(`/film/${id}/like`);
    }

    static rateMovieWithIdFilm (id: string) {
        return API.post(`/film/${id}/rate`);
    }

    static getPopularMovies() {
        return API.get('/film/popular');
    }

    static getRecentMovies() {
        return API.get('/film/recent');
    }

    static getTopRateMovies() {
        return API.get('/film/top-rated');
    }

    static getMaxTopRatedMovie() {
        return API.get('/film/max/top-rate');
    }
}