import { createSlice } from "@reduxjs/toolkit";
import { IAuthState } from "./interface.auth";
import { loginThunk, registerThunk } from "./thunk.auth";

const initialState: IAuthState = {
    loading: false,
    error: null,
    response: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(loginThunk.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                localStorage.setItem("accessToken", action.payload.data.accessToken);
                localStorage.setItem("user_info", JSON.stringify(action.payload.data.user))
                console.log("payload: ", action.payload);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(registerThunk.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                localStorage.setItem("accessToken", action.payload.data.accessToken);
                localStorage.setItem("user_info", JSON.stringify(action.payload.data.user))
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
})

export default authSlice.reducer;