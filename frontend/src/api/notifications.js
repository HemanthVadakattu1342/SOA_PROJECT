import api from "./axios";

export const notificationAPI = {
  getMy:          (page = 0, size = 20) => api.get(`/notifications/my?page=${page}&size=${size}`),
  getUnread:      ()                    => api.get("/notifications/unread"),
  getUnreadCount: ()                    => api.get("/notifications/unread-count"),
  markAllRead:    ()                    => api.post("/notifications/mark-read"),
};
