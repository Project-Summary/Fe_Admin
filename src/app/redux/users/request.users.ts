import { CreateUserDto, UpdateUserDto } from "@/interface/user.interface";
import API from "../api";

export class UsersAPI {
    static getAllUsers() {
        return API.get('/users');
    }

    static getCurrentUser() {
        return API.get('/users/me');
    }

    static findOneUsers(id: string  ) {
        return API.get(`/users/${id}`);
    }   

    static createUser (data: CreateUserDto) {
        return API.post('/users', data);
    }

    static updateCurrentUser (data: UpdateUserDto) {
        return API.patch('/users/me', data);
    }

    static updateUser (id: string, data: UpdateUserDto) {
        return API.patch(`/users/${id}`, data);
    }

    static deleteUser (id: string) {
        return API.delete(`/users/${id}`);
    }

    static getUserStatistics(id: string) {
        return API.get(`users/statistics/${id}`);
    }

    static getWatchList () {
        return API.get('users/me/watchlist');
    }

    static addToWatchList(contentId: string) {
        return API.post(`users/me/watchlist/${contentId}`);
    }

    static removeFromWatchList (contentId: string) {
        return API.delete(`users/me/watchlist/${contentId}`);
    }

    static getViewHistory () {
        return API.get('users/me/view-history');
    }
}
