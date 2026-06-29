'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
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
  return useMutation({
    mutationFn: ({ interviewId, data }: { interviewId: string, data: any }) => 
      queriesApi.submit(interviewId, data),
  });
}
