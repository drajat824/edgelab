import axios from 'axios';

const api = axios.create({
  // Sesuaikan port dengan port FastAPI Anda (biasanya 8000)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000, // Kontrol hardware kadang butuh waktu, set 15 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor untuk simplifikasi penanganan error
api.interceptors.response.use(
  (response) => response.data, // Langsung kembalikan data bersih (response.data)
  (error) => {
    // Tangkap detail error yang dikirim oleh HTTPException FastAPI
    const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;