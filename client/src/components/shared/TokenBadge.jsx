import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { stitch } from '../../lib/stitch';

// Shared Status Color Mapping
export const getStatusColors = (status) => {
  switch (status) {
    case 'waiting': return { border: 'border-amber', bg: 'bg-amber-glow', text: 'text-amber', raw: '#D4A373' };
    case 'checked_in': return { border: 'border-accent', bg: 'bg-accent-glow', text: 'text-accent', raw: '#4A5D4E' };
    case 'in_service': return { border: 'border-green', bg: 'bg-green-glow', text: 'text-green', raw: '#9BA993' };
    case 'completed': return { border: 'border-purple', bg: 'bg-purple-glow', text: 'text-purple', raw: '#9D8189' };
    case 'emergency': return { border: 'border-red', bg: 'bg-red/10', text: 'text-red', raw: '#C0857E' };
    default: return { border: 'border-border', bg: 'bg-surface', text: 'text-text', raw: '#BCAE9B' };
  }
};

/**
 * Animated number component (stitch.animate.countUp)
 */
export const AnimatedNumber = ({ value }) => {
  const spring = useSpring(value, { stiffness: 60, damping: 15, mass: 1 });
  const display = useTransform(spring, (current) => Math.round(current));
  
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

export const TokenBadge = ({ number, size = 'md', status, animated = true }) => {
  const colors = getStatusColors(status);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs border-2',
    md: 'w-12 h-12 text-sm border-2',
    lg: 'w-16 h-16 text-xl border-[3px]',
    xl: 'w-24 h-24 text-3xl border-4',
    xxl: 'w-[180px] h-[180px] text-7xl border-8' // Custom for TV display
  };

  const isServing = status === 'in_service';

  return (
    <motion.div 
      className={`relative inline-flex items-center justify-center font-display font-black rounded-full ${colors.border} ${colors.text} ${sizeClasses[size]} bg-bg shadow-level-1 overflow-hidden shrink-0 z-10`}
      {...(isServing && animated ? stitch.animate.pulse : {})}
      style={isServing ? { boxShadow: `0 0 20px ${colors.raw}40` } : {}}
    >
      {/* Background glow overlay */}
      <div className={`absolute inset-0 ${colors.bg} opacity-50`} />
      
      <span className="relative z-10 drop-shadow-md">
        {animated && typeof number === 'number' ? <AnimatedNumber value={number} /> : number || '—'}
      </span>
    </motion.div>
  );
};
