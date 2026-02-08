import axios from "axios";
// import { apiBaseUrl } from "./config";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || "");
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

const refreshAccessToken = () => {
  if (typeof window === "undefined") {
    return Promise.reject("No window object");
  }

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    window.location.href = "/login";
    return Promise.reject("No refresh token available");
  }

  return api
    .post("/auth/refresh-token", { refresh: refreshToken }, {
      skipInterceptor: true, // Prevent infinite loop
    } as any)
    .then((response: any) => {
      const newAccessToken = response.data?.access || response.access;
      const SESSION_DURATION = 12 * 60 * 60 * 1000;
      const newExpiresAt = Date.now() + SESSION_DURATION;

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("expiresAt", newExpiresAt.toString());

      return newAccessToken;
    })
    .catch((error: any) => {
      // Refresh token is invalid, logout user
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiresAt");
      window.location.href = "/login";
      return Promise.reject(error);
    });
};

api.interceptors.request.use(
  (config) => {
    // Skip interceptor if already refreshing
    if ((config as any).skipInterceptor) {
      return config;
    }

    // Client-side execution check
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return refreshAccessToken()
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        })
        .catch((err) => {
          processQueue(err, null);
          return Promise.reject(error.response?.data || error.message);
        });
    }

    // Handle error logging or global error states here
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
