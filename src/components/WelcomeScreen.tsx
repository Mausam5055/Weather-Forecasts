import React from 'react';
import { MapPin } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import weatherHouse from '../assets/weather-house.svg';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSearch: (query: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onGetStarted, 
  onSearch, 
  darkMode, 
  onToggleTheme 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white dark:bg-black"
    >
      {/* Theme Toggle Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 right-6 z-50 md:top-8 md:right-8"
      >
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
      </motion.div>

      {/* Background Gradient */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-white dark:via-black to-pink-500/10"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 w-32 h-32 relative"
        >
          <img 
            src={weatherHouse} 
            alt="Weather House" 
            className="w-full h-full drop-shadow-2xl"
            loading="eager"
          />
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          >
            <img 
              src={weatherHouse} 
              alt="Weather House Glow" 
              className="w-full h-full blur-sm"
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl font-bold text-gray-900 dark:text-white text-center mb-4"
        >
          Weather<span className="text-purple-400">App</span>
        </motion.h1>

        {/* Search and Location Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-md mb-8"
        >
          <SearchBar 
            onSearch={onSearch}
            placeholder="Enter city name..."
            className="mb-6"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="flex items-center gap-3 text-gray-900 dark:text-white/90 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/10 dark:bg-white/10 px-6 py-3 rounded-full backdrop-blur-lg border border-gray-200 dark:border-white/20 hover:bg-white/15 dark:hover:bg-white/15 transition-all duration-300 mx-auto"
          >
            <MapPin size={20} />
            <span className="font-medium">Use my current location</span>
          </motion.button>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-gray-600 dark:text-white/70 text-base mt-4 text-center max-w-xs font-medium"
        >
          Get real-time weather updates for any location with beautiful visualizations
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="fixed bottom-6 left-0 right-0 flex justify-center"
        >
          <div className="flex gap-2 text-gray-600 dark:text-white/50 text-sm bg-white/10 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-gray-200 dark:border-white/20">
            <span>Powered by</span>
            <a 
              href="https://www.weatherapi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              WeatherAPI.com
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 