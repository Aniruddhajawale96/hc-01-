import React from 'react';
import { motion } from 'framer-motion';
import { stitch } from '../../lib/stitch';

export const ActionButton = ({ label, onClick, variant = 'primary', color = 'cyan', loading, disabled, fullWidth, icon: Icon }) => {
  const getVariants = () => {
    if (disabled || loading) return 'opacity-50 cursor-not-allowed bg-surface text-text-muted';
    if (variant === 'primary') {
      if (color === 'cyan') return 'btn-primary'; // gradient cyan, black text
      if (color === 'red') return 'bg-red text-[#FFFFFF] shadow-[0_0_20px_rgba(192,133,126,0.3)] hover:bg-red/90';
      if (color === 'green') return 'bg-green text-[#FFFFFF] shadow-[0_0_20px_rgba(155,169,147,0.3)] hover:bg-green/90';
    }
    if (variant === 'secondary') {
      if (color === 'green') return 'border-2 border-green text-green hover:bg-green-glow';
      return 'btn-secondary';
    }
    // minimal/ghost
    if (variant === 'icon') {
      if (color === 'green') return 'bg-green-glow text-green hover:bg-green/20';
      if (color === 'cyan') return 'bg-accent-glow text-accent hover:bg-accent/20';
      if (color === 'purple') return 'bg-purple-glow text-purple hover:bg-purple/20';
    }
  };

  const isIcon = variant === 'icon';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 font-bold outline-none transition-colors
        ${isIcon ? 'w-10 h-10 rounded-full' : 'px-6 py-3 rounded-xl'} 
        ${fullWidth ? 'w-full' : ''}
        ${getVariants()}`}
      {...stitch.animate.springPop}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {Icon && <Icon size={isIcon ? 18 : 20} />}
          {!isIcon && label}
        </>
      )}
    </motion.button>
  );
};
