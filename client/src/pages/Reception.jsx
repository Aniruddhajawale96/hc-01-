import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stitch } from '../lib/stitch';
import { useQueueStore } from '../store/useQueueStore';
import { QueueItem } from '../components/shared/QueueItem';
import { MetricCard } from '../components/shared/MetricCard';
import { StatusPill } from '../components/shared/StatusPill';
import { ActionButton } from '../components/shared/ActionButton';
import { Users, UserCircle2, ArrowRight } from 'lucide-react';

export const Reception = ({ showToast }) => {
  const store = useQueueStore();
  const tokens = store.tokens;
  const stats = store.getStats();
  
  const [form, setForm] = useState({ patientName: '', patientId: '', priority: 'general' });
  const [filter, setFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [lastGen, setLastGen] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName.trim()) {
      showToast({ message: 'Patient Name is required', type: 'error', key: Date.now() });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
      store.generateToken({
        patientName: form.patientName,
        patientId: form.patientId,
        priority: form.priority
      });
      setForm({ patientName: '', patientId: '', priority: 'general' });
      const newLen = useQueueStore.getState().tokens.length;
      setLastGen(newLen); // Assuming numbers are mapped 1-1 with array length for simplicity
      showToast({ message: `Token generated successfully`, type: 'success', key: Date.now() });
      setSubmitting(false);
    }, 400);
  };

  const handleAction = (action, id) => {
    if (action === 'checkIn') {
      store.checkIn(id);
      showToast({ message: `Patient checked in`, type: 'success', key: Date.now() });
    }
  };

  const filtered = tokens.filter(t => {
    if (filter === 'Waiting') return t.status === 'waiting';
    if (filter === 'Checked In') return t.status === 'checked_in';
    if (filter === 'In Service') return t.status === 'in_service';
    return true; // All
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-12">
      
      {/* Left Column: Generator Form (Span 5) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        <div className="bg-card rounded-2xl border-l-[3px] border-l-accent shadow-level-2 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 mb-1">
              <UserCircle2 className="text-accent" /> Register Patient
            </h2>
            <p className="text-sm font-mono text-text-muted">Next auto-generated token: #{tokens.length + 1}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Patient Name *</label>
              <input 
                type="text" 
                placeholder="Enter full name"
                value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-text outline-none transition-colors
                           focus:border-accent focus:shadow-[0_0_20px_rgba(74,93,78,0.1)] placeholder:text-text-dim"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Patient ID (Optional)</label>
              <input 
                type="text" 
                placeholder="Auto-assigned if empty"
                value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-text outline-none transition-colors focus:border-accent font-mono placeholder:text-text-dim"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  {...stitch.animate.springPop}
                  onClick={() => setForm({ ...form, priority: 'general' })}
                  style={{ willChange: 'transform' }}
                  className={`p-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                    form.priority === 'general' ? 'border-accent bg-accent-glow text-accent' : 'border-border bg-surface text-text hover:bg-border/50'
                  }`}
                >
                  Regular
                </motion.button>
                <motion.button
                  type="button"
                  {...stitch.animate.springPop}
                  onClick={() => setForm({ ...form, priority: 'emergency' })}
                  style={{ willChange: 'transform' }}
                  className={`p-3 rounded-xl border-2 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    form.priority === 'emergency' ? 'border-red bg-red/10 text-red shadow-[0_0_20px_rgba(192,133,126,0.15)]' : 'border-border bg-surface text-text hover:bg-border/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  Urgent
                </motion.button>
              </div>
            </div>

            <ActionButton 
              label={
                <span className="flex items-center gap-2">
                  {lastGen && !submitting ? `✓ Token #${lastGen} Created` : `Generate Token #${tokens.length + 1}`}<ArrowRight size={18} />
                </span>
              }
              fullWidth
              loading={submitting}
              onClick={handleSubmit} 
            />
          </form>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Waiting" value={store.getWaiting().filter(t => t.status === 'waiting').length} color="amber" Icon={Users} />
          <MetricCard label="Checked In" value={store.getWaiting().filter(t => t.status === 'checked_in').length} color="cyan" Icon={Users} />
        </div>
      </div>

      {/* Right Column: Active Queue (Span 7) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl shadow-level-1 border border-border">
          <h2 className="text-lg font-bold text-text">Active Queue <StatusPill status="waiting" label={filtered.length} /></h2>
          
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl">
            {['All', 'Waiting', 'Checked In', 'In Service'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filter === f ? 'text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {filter === f && (
                  <motion.div layoutId="queueTab" className="absolute inset-0 bg-border rounded-lg" />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="relative min-h-[400px]">
          <motion.ul 
            className="flex flex-col gap-3"
            {...stitch.animate.reorderContainer}
          >
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div {...stitch.animate.fadeScale} className="text-center py-16 text-text-muted italic">
                  No patients found in this queue.
                </motion.div>
              ) : (
                filtered.map(token => (
                  <QueueItem 
                    key={token._id}
                    token={token} 
                    onAction={handleAction} 
                  />
                ))
              )}
            </AnimatePresence>
          </motion.ul>
        </div>

      </div>

    </div>
  );
};
