import { useQuery } from '@tanstack/react-query';

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await fetch('/api/health');

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return response.json() as Promise<{ status: string }>;
    },
    retry: false,
  });
}
