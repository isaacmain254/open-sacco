import axios from "axios";
// import { apiBaseUrl } from "./config";

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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
    // Handle error logging or global error states here
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
