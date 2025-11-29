'use client';

import { useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { ME_PERSON_ID, DEFAULT_TREE_DEPTH } from '@/lib/constants';

export function useTreeData() {
  const {
    nodes,
    links,
    setGraphData,
    setIsLoading,
    setError,
  } = useAppStore();

  const hasFetched = useRef(false);

  const fetchTreeData = useCallback(async () => {
    // Always fetch with default center to maintain consistent layout
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getTreeData(ME_PERSON_ID, DEFAULT_TREE_DEPTH);
      setGraphData(data.nodes, data.links);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tree data';
      setError(message);
      console.error('Failed to fetch tree data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setGraphData, setIsLoading, setError]);

  // Fetch only once on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTreeData();
    }
  }, [fetchTreeData]);

  return {
    nodes,
    links,
    refetch: fetchTreeData,
  };
}
