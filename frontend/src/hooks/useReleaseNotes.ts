'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { releaseNotesApi } from '@/lib/api';

export function useReleaseNoteFolders() {
  return useQuery({
    queryKey: ['release-notes', 'folders'],
    queryFn: () => releaseNotesApi.listFolders(),
  });
}

export function useReleaseNoteFolder(id: string) {
  return useQuery({
    queryKey: ['release-notes', 'folder', id],
    queryFn: () => releaseNotesApi.getFolder(id),
    enabled: !!id,
  });
}

export function useCreateReleaseNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => releaseNotesApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
    },
  });
}

export function useUpdateReleaseNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) =>
      releaseNotesApi.updateFolder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
      queryClient.invalidateQueries({ queryKey: ['release-notes', 'folder', id] });
    },
  });
}

export function useDeleteReleaseNoteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => releaseNotesApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
    },
  });
}

export function useCreateReleaseNoteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, data }: { folderId: string; data: { title: string; content: string; file_url?: string } }) =>
      releaseNotesApi.createDocument(folderId, data),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
      queryClient.invalidateQueries({ queryKey: ['release-notes', 'folder', folderId] });
    },
  });
}

export function useUpdateReleaseNoteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId, data }: { id: string; folderId: string; data: { title: string; content: string; file_url?: string } }) =>
      releaseNotesApi.updateDocument(id, data),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
      queryClient.invalidateQueries({ queryKey: ['release-notes', 'folder', folderId] });
    },
  });
}

export function useDeleteReleaseNoteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string }) => releaseNotesApi.deleteDocument(id),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ['release-notes'] });
      queryClient.invalidateQueries({ queryKey: ['release-notes', 'folder', folderId] });
    },
  });
}
