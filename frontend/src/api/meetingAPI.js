// frontend/src/api/meetingAPI.js
import axiosInstance from "./axiosInstance";

export const scheduleMeeting    = (data)         => axiosInstance.post("/meetings", data);
export const getMyMeetings      = (params = {})  => axiosInstance.get("/meetings", { params });
export const getMeetingById     = (id)           => axiosInstance.get(`/meetings/${id}`);
export const updateMeetingStatus = (id, status)  => axiosInstance.patch(`/meetings/${id}/status`, { status });
export const deleteMeeting      = (id)           => axiosInstance.delete(`/meetings/${id}`);
export const getAllUsers         = ()             => axiosInstance.get("/meetings/users");