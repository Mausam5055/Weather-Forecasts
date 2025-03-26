import React, { memo, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ darkMode, onToggle }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  }, [onToggle]);

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      type="button"
      role="switch"
      aria-checked={darkMode}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5 text-gray-300" aria-hidden="true" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';