import api from "./axios";

export const budgetAPI = {
  getAll:           ()          => api.get("/budgets"),
  getById:          (id)        => api.get(`/budgets/${id}`),
  getByDepartment:  (dept)      => api.get(`/budgets/department/${dept}`),
  getSummary:       ()          => api.get("/budgets/summary"),
  getAlerts:        ()          => api.get("/budgets/alerts"),
  getReconciliation:()          => api.get("/budgets/reconciliation"),
  create:           (data)      => api.post("/budgets", data),
  update:           (id, data)  => api.put(`/budgets/${id}`, data),
};
