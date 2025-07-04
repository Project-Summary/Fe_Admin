import API from "../api";
import { ILoginData, IRegisterData } from "./interface.auth";

export default class AuthAPI {
    static login (data: ILoginData) {
        return API.post('/users/login', data);
    }

    static register (data: IRegisterData) {
        return API.post('/users/register', data);
    }
}