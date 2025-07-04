import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Base URL của API backend
// const devEnv = process.env.NODE_ENV !== 'production';

// const baseURL = devEnv ? process.env.NEXT_PUBLIC_DEV_API : process.env.NEXT_PUBLIC_PROD_API;
const baseURL = `${process.env.NEXT_PUBLIC_DEV_API}`
  ? `${process.env.NEXT_PUBLIC_DEV_API}/api`
  : 'http://localhost:8000/api';
// Định nghĩa header constants
const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
};

// Tạo instance axios với `withCredentials` để gửi cookies
const API = axios.create({
  baseURL,
  withCredentials: true, // Bắt buộc để gửi cookies trong cross-origin
});

export const newsApi = axios.create({
  baseURL: 'https://google-news13.p.rapidapi.com',
  headers: {
    //   'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
    //   'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
    'x-rapidapi-key': 'd952fb39c4mshaf41de5b209f14bp1b437fjsne32fa37139bb',
    'x-rapidapi-host': 'google-news13.p.rapidapi.com',
  },
});
// Hàm lấy headers bao gồm API key và Authorization
const getAuthHeaders = () => {
  const headers = {
    [HEADER.API_KEY]: process.env.REACT_APP_API_KEY || 'your-api-key', // Nếu env không đúng
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers[HEADER.AUTHORIZATION] = `Bearer ${token}`;
  }

  return headers;
};

// Thêm interceptor cho request để gắn header vào mỗi request
API.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  if (req.headers) {
    Object.assign(req.headers, getAuthHeaders());
  }
  return req;
});

// Hàm refresh access token
const refreshAccessToken = async () => {
  try {
    // Gọi API refresh token
    const response = await API.post('/auth/refresh', {
      withCredentials: true, // Gửi cookies kèm theo request
    });

    const { accessToken } = response.data.accessToken;

    // Lưu accessToken mới vào localStorage
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  } catch (err) {
    console.error('Error refreshing access token', err);
    // Chuyển hướng về trang login nếu refresh token thất bại
    // window.location.href = '/auth/login';
    return Promise.reject(err);
  }
};

// Thêm interceptor cho response để xử lý khi gặp lỗi 401 (Unauthorized)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/register')
    ) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axios({
          ...originalRequest,
          withCredentials: true,
        });
      } catch (err) {
        console.error('Error retrying request after token refresh', err);
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    if (error.response && error.response.status === 403) {
      toast.error('You do not have permission to access this resource');
      window.history.back();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default API;
