import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User, Project, Skill, Experience, Education, Certificate,
  Blog, Message, Media, Setting, Hero, About, DashboardStats, VisitorData,
} from '../types';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  pages?: number;
}

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: User }>('/auth/login', { email, password }),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (data: Partial<User>) =>
    api.put<{ success: boolean; user: User }>('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),

  // Dashboard & Analytics
  getDashboardStats: () => api.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),
  getVisitorStats: () => api.get<ApiResponse<VisitorData[]>>('/analytics/visitors'),

  // Hero
  getHero: () => api.get<ApiResponse<Hero>>('/hero'),
  updateHero: (data: FormData) => api.put<ApiResponse<Hero>>('/hero', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // About
  getAbout: () => api.get<ApiResponse<About>>('/about'),
  updateAbout: (data: FormData) => api.put<ApiResponse<About>>('/about', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Skills
  getSkills: () => api.get<ApiResponse<Skill[]>>('/skills/all'),
  createSkill: (data: Partial<Skill>) => api.post<ApiResponse<Skill>>('/skills', data),
  updateSkill: (id: string, data: Partial<Skill>) => api.put<ApiResponse<Skill>>(`/skills/${id}`, data),
  deleteSkill: (id: string) => api.delete<ApiResponse<null>>(`/skills/${id}`),
  reorderSkills: (items: { _id: string; order: number }[]) =>
    api.put<ApiResponse<null>>('/skills/reorder', { items }),

  // Projects
  getProjects: () => api.get<ApiResponse<Project[]>>('/projects/all'),
  createProject: (data: Partial<Project>) => api.post<ApiResponse<Project>>('/projects', data),
  updateProject: (id: string, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete<ApiResponse<null>>(`/projects/${id}`),
  toggleProject: (id: string) => api.patch<ApiResponse<Project>>(`/projects/${id}/toggle`),

  // Experience
  getExperiences: () => api.get<ApiResponse<Experience[]>>('/experiences/all'),
  createExperience: (data: Partial<Experience>) => api.post<ApiResponse<Experience>>('/experiences', data),
  updateExperience: (id: string, data: Partial<Experience>) => api.put<ApiResponse<Experience>>(`/experiences/${id}`, data),
  deleteExperience: (id: string) => api.delete<ApiResponse<null>>(`/experiences/${id}`),

  // Education
  getEducation: () => api.get<ApiResponse<Education[]>>('/education/all'),
  createEducation: (data: Partial<Education>) => api.post<ApiResponse<Education>>('/education', data),
  updateEducation: (id: string, data: Partial<Education>) => api.put<ApiResponse<Education>>(`/education/${id}`, data),
  deleteEducation: (id: string) => api.delete<ApiResponse<null>>(`/education/${id}`),

  // Certificates
  getCertificates: () => api.get<ApiResponse<Certificate[]>>('/certificates?all=true'),
  createCertificate: (data: FormData) => api.post<ApiResponse<Certificate>>('/certificates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCertificate: (id: string, data: FormData) => api.put<ApiResponse<Certificate>>(`/certificates/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCertificate: (id: string) => api.delete<ApiResponse<null>>(`/certificates/${id}`),

  // Blog
  getBlogs: () => api.get<ApiResponse<Blog[]>>('/blogs/all'),
  createBlog: (data: Partial<Blog>) => api.post<ApiResponse<Blog>>('/blogs', data),
  updateBlog: (id: string, data: Partial<Blog>) => api.put<ApiResponse<Blog>>(`/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete<ApiResponse<null>>(`/blogs/${id}`),

  // Messages
  getMessages: (params?: Record<string, unknown>) => api.get<ApiResponse<Message[]>>('/messages', { params }),
  getMessage: (id: string) => api.get<ApiResponse<Message>>(`/messages/${id}`),
  replyMessage: (id: string, data: { replyContent: string }) => api.put<ApiResponse<Message>>(`/messages/${id}/reply`, data),
  deleteMessage: (id: string) => api.delete<ApiResponse<null>>(`/messages/${id}`),
  markAsRead: (id: string) => api.patch<ApiResponse<Message>>(`/messages/${id}/read`),

  // Media
  getMedia: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<Media[]>>('/media', { params }),
  getMediaStats: () => api.get('/media/stats'),
  uploadMedia: (formData: FormData) => api.post<ApiResponse<Media>>('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (id: string) => api.delete<ApiResponse<null>>(`/media/${id}`),

  // SEO
  getSEO: () => api.get<ApiResponse<Record<string, unknown>[]>>('/seo'),
  updateSEO: (page: string, data: Record<string, unknown>) => api.put<ApiResponse<Record<string, unknown>>>(`/seo/page/${page}`, data),

  // Settings
  getSettings: () => api.get<ApiResponse<Setting>>('/settings'),
  updateSettings: (data: FormData) => api.put<ApiResponse<Setting>>('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Admin
  getAdminUser: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

const apiHost: string = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

export function imageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiHost + url;
}

export default api;
