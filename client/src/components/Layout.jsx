import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { stitch } from '../lib/stitch';
import { LiveDot } from './shared/LiveDot';
import { useQueueStore } from '../store/useQueueStore';
import { Activity } from 'lucide-react';

const TABS = [
  { path: '/reception', label: 'Reception' },
  { path: '/doctor', label: 'Doctor' },
  { path: '/display', label: 'Display' },
  { path: '/analytics', label: 'Analytics' },
];

export const Layout = () => {
  const location = useLocation();
  const activeTokens = useQueueStore(state => state.tokens.length);
  const isDisplay = location.pathname === '/display';

  // Clock
  const [time, setTime] = React.useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  React.useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(i);
  }, []);

  // Display board is fully full-screen, no Layout chrome
  if (isDisplay) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...stitch.animate.pageTransition} className="min-h-screen bg-[#060d1a]">
          <Outlet />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Sticky Top Nav */}
      <header className="fixed top-0 inset-x-0 h-16 bg-surface border-b border-border z-40 px-4 sm:px-6 flex items-center justify-between shadow-level-1 backdrop-blur-md bg-opacity-95">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-accent-glow text-accent rounded-lg">
            <Activity size={24} />
          </div>
          <span className="font-display font-extrabold text-[20px] tracking-tight text-text hidden sm:block">
            SmartClinic
          </span>
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 bg-accent-glow rounded-full border-b-2 border-accent"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          <div className="hidden md:flex items-center gap-2">
            <span className="font-mono text-sm text-text-muted">{time}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-surface border border-border flex items-center gap-2">
              <span className="text-[11px] font-bold text-text uppercase drop-shadow-md pr-1">Live</span>
              <LiveDot active={true} size="8px" />
            </div>
            
            {activeTokens > 0 && (
              <div className="h-7 min-w-[28px] px-2 rounded-full bg-accent-glow border border-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                {activeTokens}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area with Page Transition */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            {...stitch.animate.pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
