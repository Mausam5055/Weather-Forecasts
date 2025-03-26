import React from 'react';
import { MapPin } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSearch: (query: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSearch }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#6B4EFF] to-[#9747FF] p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-56 h-56 mb-12 relative"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <motion.img 
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src="/weather-icons-master/weather/64x64/day/116.png"
          alt="Weather"
          className="w-full h-full object-contain relative z-10"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          Weather
        </h1>
        <h2 className="text-5xl font-semibold text-[#FFD700] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
          ForeCasts
        </h2>
      </motion.div>

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
          className="flex items-center gap-3 text-white/90 hover:text-white transition-colors bg-white/10 px-6 py-3 rounded-full backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-300 mx-auto"
        >
          <MapPin size={20} />
          <span className="font-medium">Use my current location</span>
        </motion.button>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-white/70 text-base mt-4 text-center max-w-xs font-medium"
      >
        Get real-time weather updates for any location with beautiful visualizations
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="fixed bottom-6 left-0 right-0 flex justify-center"
      >
        <div className="flex gap-2 text-white/50 text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-white/20">
          <span>Powered by</span>
          <a 
            href="https://www.weatherapi.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors font-medium"
          >
            WeatherAPI.com
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}; 