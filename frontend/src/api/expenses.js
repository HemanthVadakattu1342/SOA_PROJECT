import api from "./axios";

export const expenseAPI = {
  getMy:          (page = 0, size = 10) => api.get(`/expenses/my?page=${page}&size=${size}`),
  getAll:         (page = 0, size = 15) => api.get(`/expenses?page=${page}&size=${size}`),
  getPending:     (page = 0, size = 20) => api.get(`/expenses/pending?page=${page}&size=${size}`),
  getById:        (id)                  => api.get(`/expenses/${id}`),
  getByDepartment:(dept, page=0, size=20)=> api.get(`/expenses/department/${dept}?page=${page}&size=${size}`),
  create:         (data)                => api.post("/expenses", data),
  update:         (id, data)            => api.put(`/expenses/${id}`, data),
  delete:         (id)                  => api.delete(`/expenses/${id}`),
  submit:         (id)                  => api.post(`/expenses/${id}/submit`),
  approve:        (id)                  => api.post(`/expenses/${id}/approve`),
  reject:         (id, rejectionReason) => api.post(`/expenses/${id}/reject`, { rejectionReason }),
};
