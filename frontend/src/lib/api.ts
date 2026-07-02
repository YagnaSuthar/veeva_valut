import axios from 'axios';
import { Interview, InterviewListResponse, Query, User, UserListResponse } from '@/types';

// Standalone Backend URL
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  headers: {
    'ngrok-skip-browser-warning': '1',
  },
});

// Request Interceptor: Attach JWT token from LocalStorage to outgoing requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically redirect to login on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/setup') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  /**
   * Login: calls standalone backend directly, saves JWT in LocalStorage
   */
  login: async (email: string, password: string): Promise<void> => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data; // TokenResponse
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
    }
  },

  /**
   * Logout: deletes JWT from LocalStorage
   */
  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },

  /**
   * Setup initial admin account (one-time)
   */
  setupAdmin: async (data: { name: string; email: string; password: string; role?: string }): Promise<User> => {
    const res = await api.post('/auth/setup-admin', data);
    return res.data;
  },

  /**
   * Get current authenticated user details
   */
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const interviewsApi = {
  list: async (topic?: string): Promise<InterviewListResponse> => {
    const res = await api.get('/interviews', { params: topic ? { topic } : {} });
    return res.data;
  },
  get: async (id: string): Promise<Interview> => {
    const res = await api.get(`/interviews/${id}`);
    return res.data;
  },
  create: async (data: {
    title: string;
    topic: string;
    about?: string | null;
    questions: { question_text: string; order_index: number }[];
  }): Promise<Interview> => {
    const res = await api.post('/interviews', data);
    return res.data;
  },
  update: async (
    id: string,
    data: {
      title?: string;
      topic?: string;
      about?: string | null;
      questions?: { question_text: string; order_index: number }[];
    }
  ): Promise<Interview> => {
    const res = await api.put(`/interviews/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/interviews/${id}`);
  },
};

export const queriesApi = {
  submit: async (
    interviewId: string,
    formData: FormData
  ): Promise<any> => {
    const res = await api.post(`/interviews/${interviewId}/queries`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  list: async (interviewId: string): Promise<any[]> => {
    const res = await api.get(`/interviews/${interviewId}/queries`);
    return res.data;
  },
  reply: async (queryId: string, data: { message: string }): Promise<any> => {
    const res = await api.post(`/interviews/queries/${queryId}/replies`, data);
    return res.data;
  },
};

export const releaseNotesApi = {
  listFolders: async (): Promise<any[]> => {
    const res = await api.get('/release-notes/folders');
    return res.data;
  },
  getFolder: async (id: string): Promise<any> => {
    const res = await api.get(`/release-notes/folders/${id}`);
    return res.data;
  },
  createFolder: async (data: { name: string; description?: string }): Promise<any> => {
    const res = await api.post('/release-notes/folders', data);
    return res.data;
  },
  updateFolder: async (id: string, data: { name: string; description?: string }): Promise<any> => {
    const res = await api.put(`/release-notes/folders/${id}`, data);
    return res.data;
  },
  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/release-notes/folders/${id}`);
  },
  createDocument: async (folderId: string, data: { title: string; content: string; file_url?: string }): Promise<any> => {
    const res = await api.post(`/release-notes/folders/${folderId}/documents`, data);
    return res.data;
  },
  updateDocument: async (id: string, data: { title: string; content: string; file_url?: string }): Promise<any> => {
    const res = await api.put(`/release-notes/documents/${id}`, data);
    return res.data;
  },
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/release-notes/documents/${id}`);
  },
};

export const articlesApi = {
  list: async (): Promise<any[]> => {
    const res = await api.get('/articles');
    return res.data;
  },
  get: async (id: string): Promise<any> => {
    const res = await api.get(`/articles/${id}`);
    return res.data;
  },
  create: async (data: { title: string; excerpt: string; content: string; topic: string; read_time?: string }): Promise<any> => {
    const res = await api.post('/articles', data);
    return res.data;
  },
  update: async (id: string, data: { title: string; excerpt: string; content: string; topic: string; read_time?: string }): Promise<any> => {
    const res = await api.put(`/articles/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },
};

export const adminApi = {
  listUsers: async (): Promise<UserListResponse> => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
  }): Promise<User> => {
    const res = await api.post('/admin/users', data);
    return res.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
