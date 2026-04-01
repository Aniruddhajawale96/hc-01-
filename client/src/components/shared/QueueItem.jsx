import React from 'react';
import { motion } from 'framer-motion';
import { stitch } from '../../lib/stitch';
import { TokenBadge } from './TokenBadge';
import { StatusPill } from './StatusPill';
import { ActionButton } from './ActionButton';
import { getStatusColors } from './TokenBadge';
import { Check, ClipboardList, Send, X } from 'lucide-react';

export const QueueItem = ({ token, onAction, actionLoading }) => {
  const { border, bg } = getStatusColors(token.status);
  
  const getActionConfig = () => {
    switch (token.status) {
      case 'waiting': return { label: 'Check In', icon: ClipboardList, color: 'cyan', on: () => onAction('checkIn', token._id) };
      case 'checked_in': return { label: 'Send to Doctor', icon: Send, color: 'green', on: () => onAction('callNext', token._id) };
      case 'in_service': return { label: 'Mark Done', icon: Check, color: 'purple', on: () => onAction('complete', token._id) };
      case 'completed': return { label: '', icon: Check, disabled: true, color: 'purple', on: () => {} };
      default: return null;
    }
  };

  const c = getActionConfig();

  // Time format
  const time = new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.li
      // reorder Item logic
      {...stitch.animate.reorderItem}
      // exit logic
      {...stitch.animate.slideOut}
      // enter logic
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      
      className={`relative h-[72px] flex items-center p-3 rounded-2xl bg-card border-l-4 ${border} hover:bg-card-hover transition-colors shadow-level-1 overflow-hidden group`}
    >
      {/* Left accent hover glow */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex-shrink-0 mr-4 ml-1">
        <TokenBadge number={token.tokenNumber} size="md" status={token.status} animated={false} />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-text truncate">
            {token.patientName}
          </span>
          {token.priority === 'emergency' && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-red animate-pulse" />
          )}
        </div>
        <div className="text-[11px] font-mono text-text-muted mt-0.5">
          {token.patientId} • {time}
        </div>
      </div>
      
      <div className="flex-shrink-0 mx-4 hidden sm:block">
        <StatusPill status={token.status} />
      </div>
      
      <div className="flex-shrink-0">
        {c && (
          <ActionButton
            variant={c.disabled ? 'icon' : 'primary'}
            color={c.color}
            icon={c.icon}
            disabled={c.disabled}
            loading={actionLoading}
            onClick={c.on}
            label={c.label}
          />
        )}
      </div>
    </motion.li>
  );
};
