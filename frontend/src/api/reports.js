import api from "./axios";

export const reportAPI = {
  getDashboard:     () => api.get("/reports/dashboard"),
  getMonthly:       () => api.get("/reports/monthly"),
  getCategory:      () => api.get("/reports/category"),
  getDepartment:    () => api.get("/reports/department"),
  getBudget:        () => api.get("/reports/budget"),
  getReconciliation:() => api.get("/reports/reconciliation"),
  getTrends:        () => api.get("/reports/trends"),
  getEmployee:      () => api.get("/reports/employee"),
};
