import { createContext, useContext, useState } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email: email.trim(), password });
      const { token: jwtToken, ...userData } = response.data.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const updateUserState = (updatedUser) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await authAPI.getProfile(user.id);
      if (res.data?.data) {
        updateUserState(res.data.data);
      }
    } catch {
      // silently handle
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserState, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
