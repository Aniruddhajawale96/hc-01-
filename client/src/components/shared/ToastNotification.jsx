import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stitch } from '../../lib/stitch';

export const ToastNotification = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.key}
            {...stitch.animate.notification}
            className={`
              w-72 p-4 rounded-xl shadow-level-2 border pointer-events-auto backdrop-blur-md flex items-start gap-3
              ${toast.type === 'error' ? 'bg-red/10 border-red/20 text-red' 
              : toast.type === 'success' ? 'bg-green/10 border-green/20 text-green' 
              : 'bg-surface/80 border-border text-text'}
            `}
          >
            <div className="mt-0.5">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}
            </div>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.key)}
              className="text-text-muted hover:text-text transition-colors"
            >
              ×
            </button>
            <AutoDismiss id={toast.key} onDismiss={removeToast} duration={toast.duration || 3000} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Extracted to manage its own effect lifecycle without stale closures on toasts array
const AutoDismiss = ({ id, onDismiss, duration }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, onDismiss, duration]);
  
  return null;
};
