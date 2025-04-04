import { motion, AnimatePresence } from "framer-motion";

interface ThemeTransitionProps {
  isChanging: boolean;
  isDark: boolean;
}

export default function ThemeTransition({ isChanging, isDark }: ThemeTransitionProps) {
  return (
    <AnimatePresence>
      {isChanging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={`fixed inset-0 z-[99999] backdrop-blur-md ${
            isDark 
              ? "bg-black" 
              : "bg-white"
          }`}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999
          }}
        />
      )}
    </AnimatePresence>
  );
} 