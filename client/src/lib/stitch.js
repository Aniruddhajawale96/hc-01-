import { motion } from 'framer-motion';

/**
 * Stitch MCP Simulation
 * Exposes strict, physics-based animation primitives as requested.
 * Usage: <motion.div {...stitch.animate.slideIn} />
 */
export const stitch = {
  animate: {
    // 1. Every new token card entering queue list
    slideIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { type: 'spring', mass: 1, stiffness: 80, damping: 10, duration: 0.28 },
    },
    // 2. Token status badge changes
    fadeScale: {
      initial: { opacity: 0, scale: 0.85 },
      animate: { opacity: 1, scale: 1.0 },
      transition: { duration: 0.2 },
    },
    // 4. Queue list reordering (Passed as `layout` prop in components, stagger via variants)
    reorderContainer: {
      animate: {
        transition: { staggerChildren: 0.04 },
      },
    },
    reorderItem: {
      layout: "position",
      transition: { duration: 0.35, ease: "easeInOut" },
    },
    // 5. "NOW SERVING" pulse
    pulse: {
      animate: {
        scale: [1, 1.15, 1],
        boxShadow: [
          "0 0 0px rgba(155, 169, 147, 0)",
          "0 0 20px rgba(155, 169, 147, 0.4)",
          "0 0 0px rgba(155, 169, 147, 0)"
        ]
      },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    // 6. Loading state shimmer
    skeleton: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: { duration: 1.2, repeat: Infinity, ease: "linear" },
    },
    // 7. Button press feedback
    springPop: {
      whileTap: { scale: 0.95 },
      whileHover: { scale: 1.04 },
      transition: { duration: 0.3, type: "spring" },
    },
    // 8. Token card leaving queue
    slideOut: {
      initial: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 50 },
      transition: { duration: 0.25 },
    },
    // 9. Toast notification
    notification: {
      initial: { opacity: 0, y: -20, x: 20 },
      animate: { opacity: 1, y: 0, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    // 10. Page transitions
    pageTransition: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.22, ease: "easeOut" },
    },
  }
};
