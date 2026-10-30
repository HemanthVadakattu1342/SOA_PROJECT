import api from "./axios";

export const categoryAPI = {
  getAll:    ()         => api.get("/categories"),
  getActive: ()         => api.get("/categories/active"),
  getById:   (id)       => api.get(`/categories/${id}`),
  create:    (data)     => api.post("/categories", data),
  update:    (id, data) => api.put(`/categories/${id}`, data),
  delete:    (id)       => api.delete(`/categories/${id}`),
};
