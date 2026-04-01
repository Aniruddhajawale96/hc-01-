import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stitch } from '../lib/stitch';
import { useQueueStore } from '../store/useQueueStore';
import { LiveDot } from '../components/shared/LiveDot';
import { Activity } from 'lucide-react';

export const Display = () => {
  const store = useQueueStore();
  const current = store.getCurrent();
  const queue = store.getWaiting();
  const stats = store.getStats();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg text-text selection:bg-transparent">
      
      {/* HEADER BAR (80px) */}
      <header className="h-[100px] shrink-0 border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center justify-between px-10 bg-surface/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-glow text-accent rounded-2xl border border-accent/20">
            <Activity size={36} strokeWidth={3} />
          </div>
          <span className="font-display font-extrabold text-[36px] tracking-tight text-text shadow-sm">
            SmartClinic OPD
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="font-mono text-[48px] font-bold text-accent leading-none drop-shadow-[0_0_15px_rgba(74,93,78,0.4)]">
            {timeStr}
          </span>
          <span className="text-[18px] text-text-muted font-bold tracking-widest uppercase mt-2">
            {dateStr}
          </span>
        </div>
      </header>

      {/* MAIN SECTION */}
      <main className="flex-1 flex min-h-0 bg-bg">
        
        {/* Left panel (60%) — NOW SERVING */}
        <div className="flex-[6_6_0%] border-r border-border p-16 flex flex-col justify-center items-center relative overflow-hidden">
          
          <div className="absolute top-12 left-12 flex items-center gap-3 bg-green-glow px-6 py-3 rounded-full border border-green/30">
            <LiveDot color="#9BA993" size="16px" active={true} />
            <span className="text-[18px] font-bold tracking-[0.2em] text-green uppercase drop-shadow-sm">Now Serving</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center mt-8">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div 
                  key={current._id}
                  {...stitch.animate.fadeScale}
                  className="flex flex-col items-center"
                >
                  {/* Huge token number */}
                  <motion.div
                    key={`token-${current.tokenNumber}`}
                    {...stitch.animate.countUp}
                    className="text-[250px] font-display font-black leading-none text-green drop-shadow-[0_0_80px_rgba(155,169,147,0.3)] mb-8"
                  >
                    {current.tokenNumber}
                  </motion.div>
                  
                  {/* Patient Name */}
                  <div className="text-[64px] font-bold text-text tracking-tight drop-shadow-md">
                    {current.patientName}
                  </div>
                  
                  {/* Directional Subtext */}
                  <div className="text-[28px] text-text-muted mt-6 font-medium bg-surface/50 px-8 py-4 rounded-full border border-border">
                    Please proceed to consultation room
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  {...stitch.animate.fadeScale}
                  className="flex flex-col items-center opacity-40"
                >
                  <div className="text-[250px] font-display font-black leading-none text-border mb-8">—</div>
                  <div className="text-[48px] font-bold tracking-tight">Waiting for patient...</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel (40%) — QUEUE INFO */}
        <div className="flex-[4_4_0%] p-12 bg-surface/30 flex flex-col">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <h2 className="text-[24px] font-bold tracking-wider text-text-muted uppercase">Up Next</h2>
            <div className="text-[24px] font-display font-bold text-accent bg-accent-glow px-4 py-1 rounded-full">
              {queue.length} Wait
            </div>
          </div>

          <ul className="flex flex-col gap-4 flex-1">
            <AnimatePresence>
              {queue.slice(0, 5).map((token, idx) => (
                <motion.li
                  key={token._id}
                  {...stitch.animate.reorderItem}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  className="flex items-center gap-6 p-6 rounded-[24px] bg-card border border-border/50 shadow-level-1"
                >
                  <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-surface border border-border flex items-center justify-center font-display text-[24px] font-bold text-text-muted">
                    {idx + 1}
                  </div>
                  
                  <div className="w-[96px] h-[96px] shrink-0 rounded-full bg-bg border-4 border-amber flex items-center justify-center font-display text-[42px] font-black text-amber shadow-[0_0_20px_rgba(212,163,115,0.2)]">
                    {token.tokenNumber}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-[32px] font-bold text-text truncate drop-shadow-sm mb-2">
                      {token.patientName}
                    </div>
                    {token.priority === 'emergency' && (
                      <span className="inline-block px-3 py-1 bg-red/20 text-red text-[16px] font-bold tracking-wider rounded-full border border-red/30">
                        URGENT
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            
            {queue.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[32px] font-bold text-text-muted italic opacity-50">Queue is empty</p>
              </div>
            )}
          </ul>

          {/* Wait Time Display block */}
          <div className="mt-8 pt-8 border-t border-border flex items-center justify-between bg-card p-8 rounded-[32px] border border-accent/20 shadow-[0_0_40px_rgba(74,93,78,0.05)]">
            <div>
              <div className="text-[18px] font-bold text-text-muted tracking-widest uppercase mb-2">Estimated Wait</div>
              <div className="text-[20px] text-text-muted opacity-80">Based on AI historical data</div>
            </div>
            <div className="flex items-baseline gap-4">
              <motion.div 
                key={stats.estWaitTime}
                {...stitch.animate.countUp}
                className="text-[100px] font-display font-black leading-none text-amber drop-shadow-[0_0_30px_rgba(212,163,115,0.2)]"
              >
                {stats.estWaitTime}
              </motion.div>
              <span className="text-[32px] font-bold text-text-muted">mins</span>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM TICKER (60px) */}
      <footer className="h-[60px] shrink-0 bg-accent text-black overflow-hidden flex items-center font-bold text-[20px]">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] inline-block">
          <span className="mx-8">&bull;</span> Please keep your token ready. 
          <span className="mx-8">&bull;</span> Estimated wait time for new patients is {stats.estWaitTime + stats.avgConsultTime} minutes.
          <span className="mx-8">&bull;</span> In case of emergency, please notify the reception immediately.
          <span className="mx-8">&bull;</span> Thank you for choosing SmartClinic!
          {/* Duplicate to appear continuous */}
          <span className="mx-8">&bull;</span> Please keep your token ready. 
          <span className="mx-8">&bull;</span> Estimated wait time for new patients is {stats.estWaitTime + stats.avgConsultTime} minutes.
          <span className="mx-8">&bull;</span> In case of emergency, please notify the reception immediately.
          <span className="mx-8">&bull;</span> Thank you for choosing SmartClinic!
        </div>
      </footer>

    </div>
  );
};
