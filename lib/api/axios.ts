/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from "axios";
import { triggerLogout } from "../utils";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://esghorizon-engine.onrender.com",
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error: any) => void;
}> = [];

export const setLoginState = (state: boolean) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", state ? "true" : "false");
    }
};

const getLoginState = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("isLoggedIn") === "true";
    }
    return false;
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            getLoginState() &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("/auth/refresh");
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                triggerLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        // 🔹 Handle 429 (rate limit exceeded)
        if (error.response && error.response.status === 429) {
            const message =
                error.response.data?.message ||
                "Too many requests. Please slow down.";
            toast.error(message, { autoClose: 4000 });
        }
        return Promise.reject(error);
    }
);

const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then((res) => res.data);
const post = <D = any>(url: string, data?: D, config?: AxiosRequestConfig) =>
    api.post(url, data, config).then((res) => res.data);
const patch = <D = any>(url: string, data?: D, config?: AxiosRequestConfig) =>
    api.patch(url, data, config).then((res) => res.data);
const del = (url: string, config?: AxiosRequestConfig) =>
    api.delete(url, config).then((res) => res.data);

const apiUtil = {
    get,
    post,
    patch,
    delete: del,
};

export default apiUtil;
