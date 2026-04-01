import React from 'react';
import { motion } from 'framer-motion';
import { stitch } from '../../lib/stitch';

export const SkeletonCard = ({ width = '100%', height = '72px', className = '' }) => {
  return (
    <motion.div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%)',
        backgroundSize: '200% 100%'
      }}
      className={`rounded-2xl ${className}`}
      {...stitch.animate.skeleton}
    />
  );
};
