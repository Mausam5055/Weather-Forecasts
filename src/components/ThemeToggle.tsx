import React, { memo, useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ darkMode, onToggle }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  }, [onToggle]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={!isMobile ? { scale: 1.05 } : undefined}
      whileTap={!isMobile ? { scale: 0.95 } : undefined}
      className={`
        p-2.5 rounded-xl backdrop-blur-lg theme-transition
        ${darkMode 
          ? 'bg-black/30 hover:bg-black/40 border border-white/10' 
          : 'bg-white/50 hover:bg-white/60 border border-gray-200'
        }
        focus:outline-none focus:ring-2 focus:ring-purple-400/20
      `}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      type="button"
      role="switch"
      aria-checked={darkMode}
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ 
          duration: isMobile ? 0.1 : 0.2,
          ease: "easeInOut",
          type: "spring",
          stiffness: isMobile ? 400 : 300
        }}
        className="theme-transition"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-white/90" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5 text-gray-900" aria-hidden="true" />
        )}
      </motion.div>
    </motion.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';