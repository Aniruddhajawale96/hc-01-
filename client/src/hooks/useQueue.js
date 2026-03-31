import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';
import * as api from '../services/api';

export default function useQueue() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Fetch queue from API ──
  const fetchQueue = useCallback(async () => {
    try {
      const res = await api.getQueue();
      const data = res.data || res;
      setQueue(Array.isArray(data) ? data : []);
      const current = (Array.isArray(data) ? data : []).find(t => t.status === 'in-progress');
      setCurrentToken(current || null);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  }, []);

  // ── Fetch live stats ──
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getLiveStats();
      setStats(res.data || res);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // ── Token actions ──
  const createToken = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.createToken(data);
      return res.data || res;
    } finally {
      setLoading(false);
    }
  }, []);

  const callNext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.callNextPatient();
      return res.data || res;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeToken = useCallback(async (tokenNumber) => {
    setLoading(true);
    try {
      const res = await api.completeConsultation(tokenNumber);
      return res.data || res;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTokenAction = useCallback(async (tokenId) => {
    setLoading(true);
    try {
      const res = await api.cancelToken(tokenId);
      return res.data || res;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket.IO setup ──
  useEffect(() => {
    fetchQueue();
    fetchStats();

    const socket = getSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('token_created', (token) => {
      // Only refetch stats, queue_updated will handle queue
      fetchStats();
    });

    socket.on('queue_updated', (data) => {
      const updatedQueue = Array.isArray(data) ? data : [];
      setQueue(updatedQueue);
      const current = updatedQueue.find(t => t.status === 'in-progress');
      setCurrentToken(current || null);
    });

    socket.on('patient_called', (token) => {
      // Trust queue_updated for consistency
      setCurrentToken(token);
    });

    socket.on('consultation_complete', (token) => {
      // Rely on queue_updated instead of full refetch
    });

    socket.on('wait_time_updated', (data) => {
      // Use stats from socket instead of API call
      setStats(prev => ({ ...prev, ...data }));
    });

    socket.on('emergency_alert', () => {
      fetchQueue();
    });

    // Fallback polling every 10s (only if socket disconnects)
    const interval = setInterval(() => {
      if (!socket.connected) {
        fetchQueue();
        fetchStats();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('token_created');
      socket.off('queue_updated');
      socket.off('patient_called');
      socket.off('consultation_complete');
      socket.off('wait_time_updated');
      socket.off('emergency_alert');
    };
  }, [fetchQueue, fetchStats]);

  return {
    queue,
    currentToken,
    stats,
    connected,
    loading,
    createToken,
    callNext,
    completeToken,
    cancelToken: cancelTokenAction,
    refetch: fetchQueue,
    refetchStats: fetchStats,
  };
}
