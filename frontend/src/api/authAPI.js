// frontend/src/api/authAPI.js
import axiosInstance from "./axiosInstance";

export const registerAPI     = (data) => axiosInstance.post("/auth/register", data);
export const loginAPI        = (data) => axiosInstance.post("/auth/login", data);
export const logoutAPI       = ()     => axiosInstance.post("/auth/logout");
export const getMeAPI        = ()     => axiosInstance.get("/auth/me");
export const refreshTokenAPI = ()     => axiosInstance.post("/auth/refresh");
export const changePasswordAPI = (data) => axiosInstance.put("/auth/change-password", data);