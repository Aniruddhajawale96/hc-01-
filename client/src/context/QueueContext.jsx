import { create } from 'zustand';
import { useEffect } from 'react';
import { devtools } from 'zustand/middleware';
import { useSocket } from './SocketContext';
import * as api from '../services/api';

const useQueueStore = create(
  devtools((set, get) => ({
    queue: [],
    currentToken: null,
    stats: null,
    loading: false,
    connected: false,

    setLoading: (loading) => set({ loading }),
    setConnected: (connected) => set({ connected }),

    fetchQueue: async () => {
      const { setLoading, setQueue, setCurrentToken } = get();
      setLoading(true);
      try {
        const data = await api.getQueue();
        setQueue(Array.isArray(data) ? data : []);
        const current = (Array.isArray(data) ? data : []).find(t => t.status === 'in-progress');
        setCurrentToken(current || null);
      } catch (error) {
        console.error('Fetch queue error:', error);
      } finally {
        setLoading(false);
      }
    },

    fetchStats: async () => {
      try {
        const data = await api.getLiveStats();
        get().setStats(data);
      } catch (error) {
        console.error('Fetch stats error:', error);
      }
    },

    createToken: async (data) => {
      const { setLoading } = get();
      setLoading(true);
      try {
        const res = await api.createToken(data);
        return res;
      } finally {
        setLoading(false);
      }
    },

    callNext: async () => {
      const { setLoading } = get();
      setLoading(true);
      try {
        const res = await api.callNextPatient();
        return res;
      } finally {
        setLoading(false);
      }
    },

    completeToken: async (tokenNumber) => {
      const { setLoading } = get();
      setLoading(true);
      try {
        const res = await api.completeConsultation(tokenNumber);
        return res;
      } finally {
        setLoading(false);
      }
    },

    setQueue: (queue) => set({ queue }),
    setCurrentToken: (currentToken) => set({ currentToken }),
    setStats: (stats) => set({ stats }),

    // Socket listeners added via useQueue hook
  }), { name: 'queue-store' })
);

export const QueueProvider = ({ children }) => {
  const socket = useSocket().socket;
  const { setConnected, setQueue, setCurrentToken, setStats, fetchQueue, fetchStats } = useQueueStore();

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('queue_updated', (data) => {
      const updatedQueue = Array.isArray(data) ? data : [];
      setQueue(updatedQueue);
      const current = updatedQueue.find(t => t.status === 'in-progress');
      setCurrentToken(current || null);
    });

    socket.on('token_created', fetchStats);
    socket.on('patient_called', fetchQueue);
    socket.on('consultation_complete', fetchQueue);
    socket.on('wait_time_updated', fetchStats);

    // Initial fetch
    fetchQueue();
    fetchStats();

    const interval = setInterval(() => {
      if (!socket.connected) {
        fetchQueue();
        fetchStats();
      }
    }, 10000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue_updated');
      socket.off('token_created');
      socket.off('patient_called');
      socket.off('consultation_complete');
      socket.off('wait_time_updated');
      clearInterval(interval);
    };
  }, [socket]);

  return children;
};

export const useQueue = useQueueStore;

