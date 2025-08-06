import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://esghorizon-engine.up.railway.app",
  withCredentials: true, // 👈 ensures cookies are sent
});

export default api;
