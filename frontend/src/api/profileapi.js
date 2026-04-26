// frontend/src/api/profileapi.js
import axiosInstance from "./axiosInstance";

export const getMyProfileAPI      = ()       => axiosInstance.get("/profile/me");
export const updateMyProfileAPI   = (data)   => axiosInstance.put("/profile/me", data);
export const getProfileByIdAPI    = (id)     => axiosInstance.get(`/profile/${id}`);
export const getAllProfilesAPI     = (params) => axiosInstance.get("/profile", { params });
export const deactivateAccountAPI = ()       => axiosInstance.delete("/profile/me");