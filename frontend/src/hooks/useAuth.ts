'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { User } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  /**
   * Login: calls proxy which sets the HttpOnly cookie, then refetches user.
   * Returns { ok: true } on success or { ok: false, error: string } on failure.
   */
  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await authApi.login(email, password);
      // Refetch /auth/me now that the cookie is set
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      return { ok: true };
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Invalid credentials';
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.setQueryData(['auth', 'me'], null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return {
    user: user ?? null,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  };
}
