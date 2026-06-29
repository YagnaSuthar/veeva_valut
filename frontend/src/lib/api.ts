import axios from 'axios';
import { Interview, InterviewListResponse, Query, User, UserListResponse } from '@/types';

// All backend API calls go through Next.js rewrite /api/backend/* → http://localhost:8000/*
// The middleware at src/middleware.ts injects the HttpOnly cookie as Bearer token.
const baseURL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')
  : '/api/backend';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Redirect to /login on 401, but avoid loops on auth pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
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
   * Login: calls Next.js /api/auth proxy which sets HttpOnly cookie.
   */
  login: async (email: string, password: string): Promise<void> => {
    const res = await axios.post('/api/auth', { email, password });
    if (!res.data.ok) {
      throw new Error(res.data.error || 'Login failed');
    }
  },

  /**
   * Logout: clears the HttpOnly cookie.
   */
  logout: async (): Promise<void> => {
    await axios.delete('/api/auth');
  },

  /**
   * Setup initial admin account (one-time).
   */
  setupAdmin: async (data: { name: string; email: string; password: string; role?: string }): Promise<User> => {
    const res = await api.post('/auth/setup-admin', data);
    return res.data;
  },

  /**
   * Get current authenticated user (token injected by middleware from cookie).
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
    data: { sender_name: string; sender_email: string; message: string }
  ): Promise<Query> => {
    const res = await api.post(`/interviews/${interviewId}/queries`, data);
    return res.data;
  },
  list: async (interviewId: string): Promise<Query[]> => {
    const res = await api.get(`/interviews/${interviewId}/queries`);
    return res.data;
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
