import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage =
      error.response?.data?.detail || "Terjadi kesalahan pada server";
    return Promise.reject(new Error(errorMessage));
  },
);

// === UNTUK EDGELAB - AI ===

const apiAi = axios.create({
  baseURL: import.meta.env.VITE_API_AI,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage =
      error.response?.data?.detail || "Terjadi kesalahan pada server";
    return Promise.reject(new Error(errorMessage));
  },
);

export { api, apiAi };
