import { CategoryDto } from "@/interface/categories.interface";
import API from "../api";

export default class CategoriesAPI {
    static getCategories() {
        return API.get('/categories');
    }

    static createCategory(data: CategoryDto) {
        return API.post('/categories/create', data);
    }

    static updateCategories(id: string, data: CategoryDto) {
        return API.patch(`/categories/${id}`, data);
    }

    static deleteCategories(id: string) {
        return API.delete(`/categories/${id}`);
    }
}