import { useEffect, useState } from 'react';
import { sdnApi, type TopologyNode, type TopologyEdge } from '@/services/api';

export function useTopology() {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [edges, setEdges] = useState<TopologyEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await sdnApi.getTopology('onos');
      setNodes(data.nodes);
      setEdges(data.edges);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topology');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();

    // Auto-refresh every 10 seconds
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, []);

  return { nodes, edges, loading, error, refetch, lastUpdate };
}
