// PlatformSDN/hooks/useApi.ts - React hook for API calls with caching
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api-optimized';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(fetchFn: () => Promise<T>, dependencies: any[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

// Hook for optimized device fetching
export function useDevices(forceRefresh: boolean = false) {
  return useApi(() => apiService.getDevices(forceRefresh), [forceRefresh]);
}

// Hook for optimized links fetching
export function useLinks(forceRefresh: boolean = false) {
  return useApi(() => apiService.getLinks(forceRefresh), [forceRefresh]);
}

// Hook for optimized flows fetching
export function useFlows(forceRefresh: boolean = false) {
  return useApi(() => apiService.getFlows(forceRefresh), [forceRefresh]);
}

// Hook for user management
export function useUser() {
  return useApi(() => apiService.getCurrentUser());
}

// Hook for all users (admin)
export function useUsers() {
  return useApi(() => apiService.getAllUsers());
}
