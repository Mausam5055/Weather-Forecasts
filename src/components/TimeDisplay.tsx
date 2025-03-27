import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export const TimeDisplay: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 z-50"
    >
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-r border-gray-200 dark:border-white/5 rounded-br-lg px-3 py-1 shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
}; 