import React, { useState, useEffect } from 'react';

export const ConsultTimer = ({ startTime, avgTimeMinutes = 15 }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const start = new Date(startTime).getTime();
    
    // Initial calculate
    setElapsed(Math.floor((Date.now() - start) / 1000));
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return <span className="font-mono text-text-muted">00:00</span>;

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  
  const isOverdue = m >= avgTimeMinutes;

  return (
    <span className={`font-mono font-bold tracking-widest ${isOverdue ? 'text-red animate-pulse' : 'text-text'}`}>
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </span>
  );
};
