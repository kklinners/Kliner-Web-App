import axios from "axios";
import { API_URL } from "@/config";
import { getToken, clearSession } from "@/auth/storage";

export const http = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const hadAuth = Boolean(error.config?.headers?.Authorization);
    const isAuth = String(error.config?.url || "").includes("/api/v1/auth/");
    if (error.response?.status === 401 && hadAuth && !isAuth) {
      await clearSession();
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.message === "Network Error" ? "Check your connection and API URL." : error.message);
    return Promise.reject(new Error(message));
  }
);

export type MyService = {
  id: string;
  serviceName: string;
  serviceCategory: string;
  status: string;
  paymentStatus: string;
  bookingDate: string;
  bookingTime: string;
  partnerName?: string | null;
  ownerSecurity?: {
    visitorCode?: string | null;
    showVisitorCode?: boolean;
    teamLeadName?: string | null;
  };
};
