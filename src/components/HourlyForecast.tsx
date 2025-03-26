import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind } from 'lucide-react';

interface HourlyForecastProps {
  forecast: Array<{
    time: string;
    temp_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    chance_of_rain: number;
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  }>;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ forecast }) => {
  const now = new Date();
  now.setMinutes(0, 0, 0); // Round to current hour

  // Get the next 24 hours
  const nextHours = forecast
    .filter((hour) => {
      const hourTime = new Date(hour.time);
      return hourTime >= now;
    })
    .slice(0, 24);

  // Format time with AM/PM
  const formatTime = (dateStr: string) => {
    const time = new Date(dateStr);
    const isToday = time.toDateString() === new Date().toDateString();
    const isTomorrow = time.toDateString() === new Date(Date.now() + 86400000).toDateString();
    
    let dateText = '';
    if (isToday) {
      dateText = 'Today';
    } else if (isTomorrow) {
      dateText = 'Tomorrow';
    } else {
      dateText = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return (
      <div className="flex flex-col">
        <span className="text-xs text-white/40">{dateText}</span>
        <span className="text-sm font-medium text-white/60">
          {time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).toUpperCase()}
        </span>
      </div>
    );
  };

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
      className="mt-6 bg-[#111111] rounded-3xl p-4 md:p-6 backdrop-blur-xl border border-white/5 shadow-2xl hover:bg-[#161616] transition-all duration-300"
    >
      <div className="text-lg md:text-xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Today's Forecast
      </div>
      <div className="hide-scrollbar horizontal-scroll">
        <div className="grid grid-flow-col auto-cols-[200px] md:auto-cols-[220px] gap-4 pb-4">
          {nextHours.map((hour, index) => {
            const hourTime = new Date(hour.time);
            const isDay = hourTime.getHours() >= 6 && hourTime.getHours() < 18;
            
            return (
              <motion.div
                key={hour.time}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#1A1A1A] rounded-2xl p-4 text-white backdrop-blur-lg border border-white/5 hover:bg-[#202020] transition-all duration-300 snap-start"
              >
                <div className="flex items-center justify-between mb-4">
                  {formatTime(hour.time)}
                  <div className="text-sm font-medium text-white/40">
                    Feels {Math.round(hour.feelslike_c)}°
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    src={getWeatherIcon(hour.condition.text, isDay)}
                    alt={hour.condition.text}
                    className="w-12 h-12 filter brightness-125"
                    title={hour.condition.text}
                  />
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {Math.round(hour.temp_c)}°
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white/60">{hour.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white/60">{Math.round(hour.wind_kph)} km/h</span>
                  </div>
                </div>

                {hour.chance_of_rain > 0 && (
                  <div className="mt-3 text-sm text-blue-400/80">
                    {hour.chance_of_rain}% chance of rain
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};