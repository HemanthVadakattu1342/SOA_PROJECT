import api from "./axios";

export const authAPI = {
  login:        (data)                  => api.post("/auth/login", data),
  register:     (data)                  => api.post("/auth/register", data),
  getProfile:   (userId)                => api.get(`/auth/profile/${userId}`),
  getAllUsers:  ()                      => api.get("/auth/users"),
  updateUser:   (userId, data)          => api.put(`/auth/users/${userId}`, data),
  getAuditLogs: (page = 0, size = 20)   => api.get(`/auth/audit-logs?page=${page}&size=${size}`),
  health:       ()                      => api.get("/auth/health"),
};
