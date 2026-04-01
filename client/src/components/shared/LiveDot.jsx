import React from 'react';
import { motion } from 'framer-motion';
import { stitch } from '../../lib/stitch';

export const LiveDot = ({ color = '#9BA993', size = '8px', active = true }) => {
  if (!active) return <div style={{ backgroundColor: '#BCAE9B', width: size, height: size, borderRadius: '50%' }} />;
  
  return (
    <motion.div
      {...stitch.animate.pulse}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  );
};
