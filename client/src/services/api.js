import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,   
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/signup")
      ) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      toast.error("Too many requests. Please try again later.");
      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
      return Promise.reject(error);
    }
    if (error.response?.status !== 400 && error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  requestPasswordReset: (email) => api.post("/auth/request-password-reset", { email }),
};

// Product service
export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getRecommendations: () => api.get("/products/recommendations"),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  generateDescription: (productData) => api.post("/products/ai-generate-description", productData),
};

// Investment service
export const investmentService = {
  getInvestments: (params) => api.get("/investments", { params }),
  getInvestment: (id) => api.get(`/investments/${id}`),
  createInvestment: (data) => api.post("/investments", data),
  getPortfolio: () => api.get("/investments/portfolio"),
  getPortfolioInsights: () => api.get("/investments/portfolio/insights"),
};

// Transaction log service
export const transactionService = {
  getTransactionLogs: (params) => api.get("/transaction-logs", { params }),
  getErrorSummary: () => api.get("/transaction-logs/error-summary"),
};

export const apiService = {
  ...authService,
  ...productService,
  ...investmentService,
  ...transactionService,
};

export default api;
