import { WEBSITE_URL } from "@/constants/app";
import axios from "axios";

const axiosBackend = axios.create({
  baseURL: WEBSITE_URL,
});

export default axiosBackend;
