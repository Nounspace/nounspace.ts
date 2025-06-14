import axios from "axios";

// Replacing the local axios instance with the configured global instance
const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
