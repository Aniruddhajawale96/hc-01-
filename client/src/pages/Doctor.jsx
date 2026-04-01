import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stitch } from '../lib/stitch';
import { useQueueStore } from '../store/useQueueStore';
import { TokenBadge } from '../components/shared/TokenBadge';
import { MetricCard } from '../components/shared/MetricCard';
import { ActionButton } from '../components/shared/ActionButton';
import { LiveDot } from '../components/shared/LiveDot';
import { ConsultTimer } from '../components/shared/ConsultTimer';
import { QueueItem } from '../components/shared/QueueItem';
import { Clock, PlayCircle, Users, CheckCircle2 } from 'lucide-react';

export const Doctor = ({ showToast }) => {
  const store = useQueueStore();
  const current = store.getCurrent();
  const queue = store.getWaiting();
  const stats = store.getStats();

  const handleCallNext = () => {
    store.callNext();
    showToast({ message: 'Calling next patient', type: 'info', key: Date.now() });
  };

  const handleComplete = () => {
    if (current) {
      store.complete(current._id);
      showToast({ message: 'Consultation marked as complete', type: 'success', key: Date.now() });
    }
  };

  return (
    <div className="max-w-[740px] mx-auto pb-12">
      
      {/* Hero Card */}
      <motion.div 
        layout
        className={`relative p-8 rounded-[24px] border border-border shadow-level-2 overflow-hidden transition-colors ${
          current ? 'bg-card border-green/30' : 'bg-surface border-border'
        }`}
        style={current ? { boxShadow: '0 0 40px rgba(155, 169, 147, 0.15)' } : {}}
      >
        {/* Top Row */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
            <LiveDot color={current ? '#9BA993' : '#8B9986'} active={true} />
            <span className="text-[10px] font-bold text-text uppercase tracking-[0.2em]">NOW SERVING</span>
          </div>
          {current && (
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-text-muted font-bold tracking-wider uppercase mb-1">TIMER</span>
              <ConsultTimer startTime={current.calledAt} avgTimeMinutes={store.avgConsultTime} />
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center text-center min-h-[160px] pb-8">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div 
                key={current._id}
                {...stitch.animate.fadeScale}
                className="flex flex-col items-center"
              >
                <motion.div 
                  key={`token-${current.tokenNumber}`}
                  {...stitch.animate.countUp} // Simulate rapid switch with mount
                  className="text-[96px] font-display font-black leading-none text-green mb-4 drop-shadow-[0_0_30px_rgba(155,169,147,0.4)]"
                >
                  {current.tokenNumber}
                </motion.div>
                <h2 className="text-[28px] font-bold text-text tracking-tight">{current.patientName}</h2>
                <p className="text-[14px] font-mono text-text-muted mt-2">ID: {current.patientId}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                {...stitch.animate.fadeScale}
                className="text-text-muted flex flex-col items-center"
              >
                <div className="text-[64px] font-display font-black leading-none opacity-20 mb-4">—</div>
                <h2 className="text-xl font-bold">No patient in consultation</h2>
                <p className="text-sm mt-2 opacity-80">Call the next patient to begin.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <ActionButton 
            label="Call Next Patient" 
            fullWidth 
            onClick={handleCallNext} 
            disabled={queue.length === 0}
            icon={PlayCircle} 
            color="cyan"
          />
          {current && (
            <ActionButton 
              label="Complete Consultation" 
              fullWidth 
              variant="secondary"
              color="green"
              icon={CheckCircle2} 
              onClick={handleComplete} 
            />
          )}
        </div>
      </motion.div>

      {/* Wait Time Strip */}
      <div className="grid grid-cols-3 gap-3 my-8">
        <MetricCard label="Avg Consult" value={stats.avgConsultTime} color="green" Icon={Clock} />
        <MetricCard label="Wait Time" value={stats.estWaitTime} color="amber" Icon={Clock} />
        <MetricCard label="Served Today" value={stats.served} color="purple" Icon={Users} />
      </div>

      {/* Upcoming Queue */}
      <div className="mt-8">
        <h3 className="text-[16px] font-bold text-text flex items-center gap-2 mb-4">
          Up Next <span className="bg-surface text-text px-2 py-0.5 rounded-full text-xs border border-border">{queue.length}</span>
        </h3>
        
        <ul className="flex flex-col gap-2">
          <AnimatePresence>
            {queue.slice(0, 5).map((token, idx) => (
              <motion.li 
                key={token._id}
                {...stitch.animate.slideOut}
                {...stitch.animate.reorderItem}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-4 p-3 rounded-2xl bg-surface border transition-colors ${
                  idx === 0 ? 'border-accent/40 bg-card shadow-level-1' : 'border-transparent'
                }`}
              >
                <div className="w-8 text-center text-[12px] font-mono text-text-muted font-bold">#{idx + 1}</div>
                <TokenBadge number={token.tokenNumber} size="sm" status={token.status} animated={false} />
                <div className="flex-1 font-bold text-text truncate ml-2">{token.patientName}</div>
                <div className="text-[11px] font-mono text-amber">
                  ETA: {Math.max(1, (idx + 1) * stats.avgConsultTime)}m
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {queue.length === 0 && (
            <div className="text-sm text-text-muted italic py-4 text-center">Queue is currently empty.</div>
          )}
        </ul>
      </div>

    </div>
  );
};
