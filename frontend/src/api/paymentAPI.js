// frontend/src/api/paymentAPI.js
import axiosInstance from "./axiosInstance";

export const getStripeKey    = ()     => axiosInstance.get("/payment/stripe-key");
export const getBalance      = ()     => axiosInstance.get("/payment/balance");
export const getTransactions = (params = {}) => axiosInstance.get("/payment/transactions", { params });
export const createDeposit   = (data) => axiosInstance.post("/payment/deposit", data);
export const confirmDeposit  = (data) => axiosInstance.post("/payment/deposit/confirm", data);
export const withdraw        = (data) => axiosInstance.post("/payment/withdraw", data);
export const transfer        = (data) => axiosInstance.post("/payment/transfer", data);