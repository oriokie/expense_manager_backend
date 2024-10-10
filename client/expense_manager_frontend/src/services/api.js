import axios from 'axios';

const API_URL = 'http://localhost:8000/';

// creating an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// adding an axios interceptor to add the token to the request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Defining the api functions to make requests to the server
export const login = (credentials) => api.post('/login', credentials);
export const register = (userData) => api.post('/register', userData);
export const logout = () => api.post('/logout');

export const getCategories = () => api.get('/categories');
export const addCategory = (category) => api.post('/categories', category);
export const updateCategory = (id, category) => api.put(`/categories/${id}`, category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getExpenses = () => api.get('/expenses');
export const addExpense = (expense) => api.post('/expenses', expense);
export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getExpenseAnalytics = () => api.get('/expenses/analytics');
export const getMonthlyExpenses = () => api.get('/expenses/monthly');

export default api;
