import { createAsyncThunk } from "@reduxjs/toolkit";
import { ILoginData, IRegisterData } from "./interface.auth";
import { AxiosError } from "axios";
import { toast } from "sonner";
import AuthAPI from "./request.auth";

export const loginThunk = createAsyncThunk('auth/login', async (
    { data, onSuccess }: { data: ILoginData, onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await AuthAPI.login(data);
        onSuccess();
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }

        toast.error("Lỗi khi đăng nhập người dùng");
        return rejectWithValue("Lỗi khi đăng nhập người dùng");
    }
});

export const registerThunk = createAsyncThunk('auth/register', async (
    { data, onSuccess }: { data: IRegisterData, onSuccess: () => void },
    { rejectWithValue }
) => {
    try {
        const response = await AuthAPI.register(data);
        onSuccess();
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
            return rejectWithValue(error.response?.data.message);
        }

        toast.error("Lỗi khi đăng ký người dùng");
        return rejectWithValue("Lỗi khi đăng ký người dùng");
    }
}); 