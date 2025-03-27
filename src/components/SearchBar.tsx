import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onInputChange?: (query: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onInputChange,
  onKeyDown,
  placeholder = "Search for a city...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onInputChange?.(newQuery);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? '0 0 25px rgba(0,0,0,0.1)' : 'none',
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          relative group backdrop-blur-xl rounded-full border transition-all duration-300
          ${isFocused 
            ? 'bg-white/60 dark:bg-black/40 border-gray-300 dark:border-white/20' 
            : 'bg-white/50 dark:bg-black/30 border-gray-200 dark:border-white/10'
          }
          hover:bg-white/60 dark:hover:bg-black/40
          hover:border-gray-300 dark:hover:border-white/20
          shadow-lg hover:shadow-xl
        `}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent rounded-full pl-6 pr-14 py-4
                   outline-none transition-all duration-300
                   text-lg font-medium tracking-wide
                   text-gray-900 dark:text-white
                   placeholder-gray-500 dark:placeholder-white/50
                   focus:placeholder-gray-400 dark:focus:placeholder-white/30"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <motion.button
            type="submit"
            whileHover={{ 
              scale: 1.05,
            }}
            whileTap={{ scale: 0.97 }}
            disabled={!query.trim()}
            className={`
              p-2.5 rounded-full transition-all duration-300
              backdrop-blur-sm
              ${!query.trim() 
                ? 'text-gray-400 dark:text-white/30 cursor-not-allowed' 
                : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:shadow-lg'
              }
            `}
          >
            <Search className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Glass effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 dark:from-white/[0.08] to-transparent opacity-50 pointer-events-none" />

        {/* Subtle glow effect on focus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 blur-xl -z-10"
        />

        {/* Inner shadow effect */}
        <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
      </motion.div>
    </motion.form>
  );
};