// src/features/auth/authService.js
import axios from "axios";

const API_URL = "https://monidashv1.onrender.com/api/users";

// REGISTER
export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

// LOGIN
export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  return res.data;
};

// GET PROFILE
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};