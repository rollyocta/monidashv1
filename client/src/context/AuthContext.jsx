// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { getProfile } from "../features/auth/authService.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return setLoading(false);
      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (err) {
        console.error(err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loginUser, logout, setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};