import { useQuery } from '@tanstack/react-query';

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/health', { signal });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return response.json() as Promise<{ status: string }>;
    },
    retry: false,
  });
}
