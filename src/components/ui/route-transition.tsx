import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom bezier curve for smooth feel
        staggerChildren: 0.1
      }}
    >
      {children}
    </motion.div>
  );
}