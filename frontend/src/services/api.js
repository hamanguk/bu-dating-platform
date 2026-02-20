import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 90000, // Render 슬립 해제 대기 (최대 90초)
});

// JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 로그아웃 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// 앱 로드 시 Render 서버 미리 깨우기 (슬립 모드 해제)
export const pingServer = () => api.get('/health').catch(() => {});

// Auth
export const loginWithGoogle = (idToken) => api.post('/auth/google', { idToken });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Users
export const updateProfile = (data) => api.put('/users/profile', data);
export const uploadProfileImage = (formData) =>
  api.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getUserProfile = (id) => api.get(`/users/${id}`);

// Posts
export const getPosts = (params) => api.get('/posts', { params });
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const toggleLike = (id) => api.post(`/posts/${id}/like`);

// Chat
export const createOrGetRoom = (data) => api.post('/chat/room', data);
export const getMyRooms = () => api.get('/chat/rooms');
export const getMessages = (roomId, params) =>
  api.get(`/chat/rooms/${roomId}/messages`, { params });

// Reports
export const createReport = (data) => api.post('/reports', data);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminReports = (params) => api.get('/admin/reports', { params });
export const updateReportStatus = (id, status) => api.patch(`/admin/reports/${id}`, { status });
export const suspendUser = (id, days) => api.post(`/admin/users/${id}/suspend`, { days });
export const unsuspendUser = (id) => api.post(`/admin/users/${id}/unsuspend`);
export const adminDeletePost = (id) => api.delete(`/admin/posts/${id}`);

export default api;
