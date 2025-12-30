import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password });

export const getMe = () => api.get('/api/auth/me');

// Settings
export const getSettings = () => api.get('/api/settings');
export const updateSettings = (data) => api.put('/api/settings', data);

// Specialties
export const getSpecialties = (activeOnly = true) =>
  api.get(`/api/specialties?active_only=${activeOnly}`);
export const createSpecialty = (data) => api.post('/api/specialties', data);
export const updateSpecialty = (id, data) => api.put(`/api/specialties/${id}`, data);
export const deleteSpecialty = (id) => api.delete(`/api/specialties/${id}`);

// Doctors
export const getDoctors = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/doctors?${queryString}`);
};
export const getDoctor = (id) => api.get(`/api/doctors/${id}`);
export const createDoctor = (data) => api.post('/api/doctors', data);
export const updateDoctor = (id, data) => api.put(`/api/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/api/doctors/${id}`);

// Schedules
export const getSchedules = (doctorId) =>
  api.get(`/api/schedules${doctorId ? `?doctor_id=${doctorId}` : ''}`);
export const createSchedule = (data) => api.post('/api/schedules', data);
export const updateSchedule = (id, data) => api.put(`/api/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/api/schedules/${id}`);

// Schedule Exceptions
export const getScheduleExceptions = (doctorId) =>
  api.get(`/api/schedule-exceptions${doctorId ? `?doctor_id=${doctorId}` : ''}`);
export const createScheduleException = (data) => api.post('/api/schedule-exceptions', data);
export const deleteScheduleException = (id) => api.delete(`/api/schedule-exceptions/${id}`);

// Available Slots
export const getAvailableSlots = (doctorId, date) =>
  api.get(`/api/available-slots/${doctorId}?date=${date}`);

// Appointments
export const getAppointments = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/appointments?${queryString}`);
};
export const getAppointment = (id) => api.get(`/api/appointments/${id}`);
export const createAppointment = (data) => api.post('/api/appointments', data);
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const cancelAppointment = (id) => api.delete(`/api/appointments/${id}`);

// Diagnostic Tests
export const getDiagnosticTests = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/diagnostic-tests?${queryString}`);
};
export const getDiagnosticTest = (id) => api.get(`/api/diagnostic-tests/${id}`);
export const createDiagnosticTest = (data) => api.post('/api/diagnostic-tests', data);
export const updateDiagnosticTest = (id, data) => api.put(`/api/diagnostic-tests/${id}`, data);
export const deleteDiagnosticTest = (id) => api.delete(`/api/diagnostic-tests/${id}`);

// Diagnostic Bookings
export const getDiagnosticBookings = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/diagnostic-bookings?${queryString}`);
};
export const createDiagnosticBooking = (data) => api.post('/api/diagnostic-bookings', data);
export const updateDiagnosticBooking = (id, data) => api.put(`/api/diagnostic-bookings/${id}`, data);

// Blog
export const getBlogPosts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/blog?${queryString}`);
};
export const getBlogPost = (slug) => api.get(`/api/blog/${slug}`);
export const getBlogCategories = () => api.get('/api/blog/categories');
export const createBlogPost = (data) => api.post('/api/blog', data);
export const updateBlogPost = (id, data) => api.put(`/api/blog/${id}`, data);
export const deleteBlogPost = (id) => api.delete(`/api/blog/${id}`);

// Contact
export const submitContact = (data) => {
  const params = new URLSearchParams(data).toString();
  return api.post(`/api/contact?${params}`);
};
export const getContactMessages = () => api.get('/api/contact-messages');
export const markMessageRead = (id) => api.put(`/api/contact-messages/${id}/read`);

// Analytics
export const getDashboardAnalytics = () => api.get('/api/analytics/dashboard');
export const getBookingsAnalytics = (days = 7) => api.get(`/api/analytics/bookings?days=${days}`);

// Export
export const exportAppointments = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return api.get(`/api/export/appointments?${params.toString()}`);
};

export default api;
