import React from 'react';
import { WeatherData } from '../types/weather';
import { Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const current = weather.current;

  // Get weather icon path
  const getWeatherIcon = (condition: string, isDay: boolean) => {
    const conditionLower = condition.toLowerCase();
    let iconName = 'cloudy';

    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      iconName = isDay ? 'clear-day' : 'clear-night';
    } else if (conditionLower.includes('rain')) {
      iconName = 'rain';
    } else if (conditionLower.includes('cloud')) {
      iconName = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    } else if (conditionLower.includes('thunder')) {
      iconName = 'thunderstorms';
    } else if (conditionLower.includes('snow')) {
      iconName = 'snow';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      iconName = 'mist';
    }

    return `/weather-icons-master/production/fill/all/${iconName}.svg`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-6 md:p-8 text-white bg-[#111111] backdrop-blur-xl shadow-2xl border border-white/5 hover:bg-[#161616] transition-all duration-300"
    >
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-3xl blur-2xl"></div>
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-6 flex items-center justify-center"
          >
            <motion.img
              src={getWeatherIcon(current.condition.text, current.is_day === 1)}
              alt={current.condition.text}
              className="w-full h-full text-white filter brightness-125"
              title={current.condition.text}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            {Math.round(current.temp_c)}°
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl mb-2 font-medium text-white/90"
          >
            {current.condition.text}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-base md:text-lg text-white/60"
          >
            Feels like {Math.round(current.feelslike_c)}°
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6 backdrop-blur-lg border border-white/5 hover:bg-[#202020] transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <Wind className="w-6 h-6 text-purple-400" />
            <span className="text-base text-white/80 font-medium">Wind</span>
          </div>
          <div className="text-xl md:text-2xl font-bold mb-1 text-white">
            {Math.round(current.wind_kph)} km/h
          </div>
          <div className="text-sm text-white/40">
            Direction: {current.wind_dir}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-[#1A1A1A] rounded-2xl p-4 md:p-6 backdrop-blur-lg border border-white/5 hover:bg-[#202020] transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <Droplets className="w-6 h-6 text-pink-400" />
            <span className="text-base text-white/80 font-medium">Humidity</span>
          </div>
          <div className="text-xl md:text-2xl font-bold mb-1 text-white">
            {current.humidity}%
          </div>
          <div className="text-sm text-white/40">
            {current.humidity < 30 ? 'Low' : 
             current.humidity < 60 ? 'Normal' : 'High'}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};