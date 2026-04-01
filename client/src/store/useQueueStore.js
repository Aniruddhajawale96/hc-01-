import { create } from 'zustand';

// Calculate exponential moving average for wait time
const calculateExponentialSmoothing = (prevAvgs, newTime, alpha = 0.3) => {
  return prevAvgs * (1 - alpha) + newTime * alpha;
};

export const useQueueStore = create((set, get) => ({
  tokens: [],
  avgConsultTime: 12, // default 12 mins
  queueDate: new Date().toISOString().split('T')[0],

  // Mock server sync (to load initial state from localStorage or DB proxy later)
  setTokens: (tokens) => set({ tokens }),

  generateToken: (data) => set((state) => {
    // Generate an ID P001, P002...
    const count = state.tokens.filter(t => t.sessionDate === state.queueDate).length + 1;
    const tokenNumber = count;
    const id = `P${tokenNumber.toString().padStart(3, '0')}`;
    
    const newToken = {
      _id: Date.now().toString(),
      tokenNumber,
      patientId: data.patientId || id,
      patientName: data.patientName,
      priority: data.priority || 'general',
      status: 'waiting', // waiting -> checked_in -> in_service -> completed
      createdAt: new Date(),
      sessionDate: state.queueDate,
    };
    
    // Sort logic handled implicitly or on getter, but let's keep array raw and sort on view
    return { tokens: [...state.tokens, newToken] };
  }),

  // Reception checks patient in (from waiting to checked_in)
  checkIn: (id) => set((state) => ({
    tokens: state.tokens.map(t => t._id === id ? { ...t, status: 'checked_in', checkedInAt: new Date() } : t)
  })),

  // Doctor calls next
  callNext: () => set((state) => {
    const queue = get().getWaiting();
    if (queue.length === 0) return state;
    
    // Priorities: emergency -> senior -> general
    const priorityWeights = { emergency: 3, senior: 2, general: 1 };
    
    // Find highest priority patient who is checked in, or just waiting
    const sorted = [...queue].sort((a, b) => {
      // Checked in gets slight boost? Prompt says just priority
      const pA = priorityWeights[a.priority] || 1;
      const pB = priorityWeights[b.priority] || 1;
      if (pA !== pB) return pB - pA;
      // Default to FIFO
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const nextPatient = sorted[0];

    // Ensure currently serving is completed or we just drop them for now in MVP
    const updatedTokens = state.tokens.map(t => {
      if (t.status === 'in_service') return { ...t, status: 'completed', completedAt: new Date() }; // Edge case cleanup
      if (t._id === nextPatient._id) return { ...t, status: 'in_service', calledAt: new Date() };
      return t;
    });

    return { tokens: updatedTokens };
  }),

  complete: (id) => set((state) => {
    const token = state.tokens.find(t => t._id === id);
    if (!token) return state;
    
    const now = new Date();
    const durationMins = token.calledAt ? (now - new Date(token.calledAt)) / 60000 : 0;
    
    // Default 15 mins for mock if completed quickly
    const actualDuration = Math.max(durationMins, 2); 

    const newAvg = calculateExponentialSmoothing(state.avgConsultTime, actualDuration);

    return {
      tokens: state.tokens.map(t => t._id === id ? { ...t, status: 'completed', completedAt: now, duration: actualDuration } : t),
      avgConsultTime: newAvg
    };
  }),

  // Computeds
  getWaiting: () => {
    const state = get();
    return state.tokens.filter(t => t.status === 'waiting' || t.status === 'checked_in');
  },
  
  getCurrent: () => {
    return get().tokens.find(t => t.status === 'in_service');
  },

  getStats: () => {
    const state = get();
    const completed = state.tokens.filter(t => t.status === 'completed');
    const waiting = state.getWaiting();
    const active = state.tokens.length;
    
    return {
      activeTokens: active,
      served: completed.length,
      avgConsultTime: Math.round(state.avgConsultTime),
      estWaitTime: Math.round(waiting.length * state.avgConsultTime)
    };
  }
}));
