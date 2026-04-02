import { useEffect, useState } from 'react';
import { sdnApi, type DashboardStatsResponse } from '@/services/api';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await sdnApi.getDashboardStats();
      setStats(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch, lastUpdate };
}
