'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api';

export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.list(),
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: () => articlesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; excerpt: string; content: string; topic: string; read_time?: string }) =>
      articlesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; excerpt: string; content: string; topic: string; read_time?: string } }) =>
      articlesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles', id] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
