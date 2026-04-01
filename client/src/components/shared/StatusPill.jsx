import React from 'react';
import { motion } from 'framer-motion';
import { stitch } from '../../lib/stitch';

const config = {
  waiting: { bg: 'bg-amber-glow', text: 'text-amber', border: 'border-amber/20', label: 'WAITING' },
  checked_in: { bg: 'bg-accent-glow', text: 'text-accent', border: 'border-accent/20', label: 'CHECKED IN' },
  in_service: { bg: 'bg-green-glow', text: 'text-green', border: 'border-green/20', label: 'SERVING' },
  completed: { bg: 'bg-purple-glow', text: 'text-purple', border: 'border-purple/20', label: 'COMPLETED' },
  emergency: { bg: 'bg-red/10', text: 'text-red', border: 'border-red/20', label: 'URGENT' },
};

export const StatusPill = ({ status }) => {
  const c = config[status] || config.waiting;

  return (
    <motion.span 
      key={status} // force re-render animation on change
      {...stitch.animate.fadeScale}
      className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.08em] border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </motion.span>
  );
};
