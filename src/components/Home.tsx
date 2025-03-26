import React, { useState, useRef, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { MapPin, Sun, Moon, Cloud, Wind, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import weatherHouse from '../assets/weather-house.svg';

interface HomeProps {
  onSearch: (query: string) => void;
  onUseLocation: () => void;
}

interface Suggestion {
  name: string;
  country: string;
}

export const Home: React.FC<HomeProps> = ({ onSearch, onUseLocation }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      // Optimize video loading for mobile
      if (isMobile) {
        videoRef.current.preload = 'none';
      }
    }
  }, [isMobile]);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.map((item: any) => ({
        name: item.name,
        country: item.country
      })));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = (query: string) => {
    onSearch(query);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSearch(suggestions[selectedIndex].name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: isMobile ? 0.4 : 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black"
    >
      {/* Video Background - Only load on desktop */}
      {!isMobile && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/assets/weather-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.5 : 1 }}
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"
      ></motion.div>
      
      {/* Animated particles - Simplified on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {!isMobile ? (
          <>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
            ></motion.div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Weather House - Simplified animation on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: isMobile ? 0.5 : 1, delay: isMobile ? 0.1 : 0.3 }}
          className="mb-8 w-48 h-48 relative"
        >
          <img 
            src={weatherHouse} 
            alt="Weather House" 
            className="w-full h-full drop-shadow-2xl"
            loading="eager"
          />
          {!isMobile && (
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
          )}
        </motion.div>

        {/* Title - Faster animation on mobile */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.4 : 0.8, delay: isMobile ? 0.2 : 0.4 }}
          className="text-5xl font-bold text-white text-center mb-4"
        >
          Weather<span className="text-purple-400">App</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: isMobile ? 0.4 : 0.8, delay: isMobile ? 0.3 : 0.5 }}
          className="text-white/70 text-lg text-center mb-8 max-w-md"
        >
          Get accurate weather forecasts for any location worldwide
        </motion.p>

        {/* Search section - Faster animation on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.4 : 0.8, delay: isMobile ? 0.4 : 0.6 }}
          className="w-full max-w-md mb-8 relative"
        >
          <SearchBar 
            onSearch={onSearch}
            onInputChange={fetchSuggestions}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city..."
            className="mb-6"
          />
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: isMobile ? 0.2 : 0.3 }}
                className="absolute w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 mt-2"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.name}-${suggestion.country}`}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    className={`px-6 py-3 cursor-pointer flex items-center gap-3 ${
                      index === selectedIndex ? 'bg-white/10' : ''
                    }`}
                    onClick={() => handleSearch(suggestion.name)}
                  >
                    <Search className="w-4 h-4 text-white/50" />
                    <div>
                      <p className="text-white font-medium">{suggestion.name}</p>
                      <p className="text-white/50 text-sm">{suggestion.country}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUseLocation}
            className="flex items-center gap-3 text-white/90 hover:text-white mx-auto
                     bg-black/30 px-8 py-4 rounded-full backdrop-blur-xl border border-white/10 
                     hover:bg-black/40 transition-all duration-300 shadow-lg"
          >
            <MapPin 
              size={24} 
              className="animate-bounce"
            />
            <span className="font-medium text-lg">Use my location</span>
          </motion.button>
        </motion.div>

        {/* Quick stats - Faster animation on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.4 : 0.8, delay: isMobile ? 0.5 : 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl"
        >
          {['Temperature', 'Conditions', 'Wind', 'Humidity'].map((stat, index) => (
            <motion.div 
              key={stat}
              whileHover={{ scale: isMobile ? 1 : 1.02 }}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
            >
              {index === 0 && <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-3" />}
              {index === 1 && <Cloud className="w-8 h-8 text-blue-400 mx-auto mb-3" />}
              {index === 2 && <Wind className="w-8 h-8 text-green-400 mx-auto mb-3" />}
              {index === 3 && <Moon className="w-8 h-8 text-purple-400 mx-auto mb-3" />}
              <p className="text-white/70 text-sm mb-1">{stat}</p>
              <p className="text-white text-2xl font-semibold">--{index === 2 ? ' km/h' : index === 3 ? '%' : '°C'}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}; 