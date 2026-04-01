import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './TokenBadge';

export const MetricCard = ({ label, value, trend, color, Icon }) => {
  const iconColors = {
    purple: 'text-purple bg-purple-glow',
    green: 'text-green bg-green-glow',
    amber: 'text-amber bg-amber-glow',
    cyan: 'text-accent bg-accent-glow',
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-level-1 hover:bg-card-hover transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-bold text-text-muted tracking-wider uppercase mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-display font-black leading-none text-text">
              <AnimatedNumber value={value} />
            </span>
            {trend && (
              <span className={`text-[13px] font-bold ${trend === 'up' ? 'text-green' : 'text-red'}`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconColors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
