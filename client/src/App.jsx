import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Reception } from './pages/Reception';
import { Doctor } from './pages/Doctor';
import { Display } from './pages/Display';
import { Analytics } from './pages/Analytics';
import { useSocketSimulator } from './hooks/useSocketSimulator';
import { ToastNotification } from './components/shared/ToastNotification';

export default function App() {
  // Demo mode: Run simulator to auto-generate mock queue data if no backend is present
  const { lastEvent } = useSocketSimulator(true);
  
  // Custom toast state
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    if (lastEvent) {
      setToasts(prev => [...prev, lastEvent]);
    }
  }, [lastEvent]);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.key !== id));

  return (
    <>
      <ToastNotification toasts={toasts} removeToast={removeToast} />
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/reception" replace />} />
          <Route path="reception" element={<Reception showToast={(msg) => setToasts(p => [...p, msg])} />} />
          <Route path="doctor" element={<Doctor showToast={(msg) => setToasts(p => [...p, msg])} />} />
          <Route path="display" element={<Display />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </>
  );
}
