import axios from 'axios';

/**
 * A dedicated Axios instance for all backend API calls.
 * In production, it targets the backend Vercel deployment.
 * In development, it uses the Vite proxy (no baseURL needed).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://gtu-ai-analyzer-backend.vercel.app"
    : "",
});

export default apiClient;
