import { useEffect, useState } from 'react';
import { useQueueStore } from '../store/useQueueStore';

/**
 * Socket.IO Simulation Hook
 * Simulates WebSocket events using setTimeout + Zustand
 * Demo mode auto-generates tokens if enabled
 */
export const useSocketSimulator = (autoRun = false) => {
  const store = useQueueStore();
  const [lastEvent, setLastEvent] = useState(null); // Used to trigger ToastNotification

  useEffect(() => {
    if (!autoRun) return;

    // Simulate auto-generating patients every 45s
    const genInterval = setInterval(() => {
      const names = ["Alex Rivera", "Sarah Chen", "Marcus Johnson", "Elena Rossi", "Liam Smith", "Omar Fayed"];
      store.generateToken({
        patientName: names[Math.floor(Math.random() * names.length)],
        priority: Math.random() > 0.8 ? 'emergency' : 'general'
      });
      setLastEvent({ message: 'Patient registered via kiosk', type: 'info', key: Date.now() });
    }, 45000);

    // Simulate queue auto-advance every 30s (checking them in)
    const advanceInterval = setInterval(() => {
      const state = useQueueStore.getState();
      const waiting = state.tokens.find(t => t.status === 'waiting');
      if (waiting) {
        state.checkIn(waiting._id);
        setLastEvent({ message: `Patient ${waiting.patientName} checked in`, type: 'success', key: Date.now() });
      }
    }, 30000);

    return () => {
      clearInterval(genInterval);
      clearInterval(advanceInterval);
    };
  }, [autoRun]);

  return { lastEvent };
};
