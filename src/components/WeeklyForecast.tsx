import React from 'react';
import { Sun, Moon, Cloud, CloudRain } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface WeeklyForecastProps {
  forecast: WeatherData['forecast']['forecastday'];
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecast }) => {
  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 1000) return isDay ? <Sun className="w-8 h-8 text-yellow-400" /> : <Moon className="w-8 h-8 text-blue-200" />;
    if (code >= 1063) return <CloudRain className="w-8 h-8 text-blue-400" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
        7-Day Forecast
      </h2>
      
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-7 gap-4">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#202020] transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white/90">{getDayName(day.date)}</div>
              <div className="text-xs text-gray-500 dark:text-white/40">{day.date.split('-')[2]} {new Date(day.date).toLocaleString('default', { month: 'short' })}</div>
              {getWeatherIcon(day.day.condition.code, true)}
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(day.day.maxtemp_c)}°</div>
              <div className="text-sm text-gray-500 dark:text-white/40">{Math.round(day.day.mintemp_c)}°</div>
              <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-white/60">
                <div className="flex items-center gap-1">
                  <span>💧</span>
                  <span>{day.day.daily_chance_of_rain}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💨</span>
                  <span>{Math.round(day.day.maxwind_kph)} km/h</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-white/60">
                <span>☀️</span>
                <span>UV: {day.day.uv}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Scroll Layout */}
      <div className="md:hidden overflow-x-auto hide-scrollbar">
        <div className="inline-flex space-x-4 w-max">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-200 dark:border-white/5 min-w-[140px] hover:bg-gray-100 dark:hover:bg-[#202020] transition-all duration-300"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white/90">{getDayName(day.date)}</div>
                <div className="text-xs text-gray-500 dark:text-white/40">{day.date.split('-')[2]} {new Date(day.date).toLocaleString('default', { month: 'short' })}</div>
                {getWeatherIcon(day.day.condition.code, true)}
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(day.day.maxtemp_c)}°</div>
                <div className="text-sm text-gray-500 dark:text-white/40">{Math.round(day.day.mintemp_c)}°</div>
                <div className="flex items-center justify-between w-full text-xs text-gray-600 dark:text-white/60">
                  <div className="flex items-center gap-1">
                    <span>💧</span>
                    <span>{day.day.daily_chance_of_rain}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💨</span>
                    <span>{Math.round(day.day.maxwind_kph)} km/h</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-white/60">
                  <span>☀️</span>
                  <span>UV: {day.day.uv}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};