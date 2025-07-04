export interface ILoginData {
    email: string;
    password: string;
}

export interface IRegisterData {
    name: string;
    email: string;
    password: string;
}

export interface IAuthState {
    loading: boolean;
    error: string | null;
    response: ILoginResponse | null;
}

export interface ILoginResponse {
    accessToken: string;
    user: IUserResponse | null
}

export interface IUserResponse {
    id: string;
    email: string;
    name: string;
}