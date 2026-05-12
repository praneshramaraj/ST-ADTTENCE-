import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("st_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("st_token");
      localStorage.removeItem("st_user");
      const url = error.config?.url || "";
      const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register-student");
      if (!isAuthAttempt && window.location.pathname !== "/login") {
        window.location.replace("/login");
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export default api;
