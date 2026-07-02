'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, queriesApi } from '@/lib/api';

export function useInterviewList(topic?: string) {
  return useQuery({
    queryKey: ['interviews', topic],
    queryFn: () => interviewsApi.list(topic),
  });
}

export function useInterview(id: string) {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsApi.get(id),
    enabled: !!id,
  });
}

export function useSubmitQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ interviewId, formData }: { interviewId: string, formData: FormData }) => 
      queriesApi.submit(interviewId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}

export function useReplyToQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queryId, data }: { queryId: string, data: { message: string } }) => 
      queriesApi.reply(queryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}
