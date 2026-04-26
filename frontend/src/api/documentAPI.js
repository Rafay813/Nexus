// frontend/src/api/documentAPI.js
import axiosInstance from "./axiosInstance";

export const uploadDocument = (formData) =>
  axiosInstance.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyDocuments      = (params = {}) => axiosInstance.get("/documents", { params });
export const getDocumentById     = (id)          => axiosInstance.get(`/documents/${id}`);
export const updateDocumentStatus = (id, status) => axiosInstance.patch(`/documents/${id}/status`, { status });
export const signDocument        = (id, signatureImage) => axiosInstance.post(`/documents/${id}/sign`, { signatureImage });
export const deleteDocument      = (id)          => axiosInstance.delete(`/documents/${id}`);