// src/utils/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // giữ lại để sau này dùng cookie nếu cần
});

// ✨ Gắn token từ localStorage vào mỗi request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // chuẩn JWT
  }
  return config;
});

export default instance;
