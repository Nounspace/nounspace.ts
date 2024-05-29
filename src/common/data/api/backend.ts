import axios from "axios";

const axiosBackend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL!,
});

export default axiosBackend;