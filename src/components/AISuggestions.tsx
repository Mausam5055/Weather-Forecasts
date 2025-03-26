import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Wind, Droplets, Umbrella, Cloud, ThermometerSun, Shirt, Activity } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AISuggestionsProps {
  weather: WeatherData;
}

type Priority = 'high' | 'medium' | 'low';

interface Suggestion {
  icon: JSX.Element;
  title: string;
  text: string;
  color: string;
  priority: Priority;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ weather }) => {
  const getSuggestions = () => {
    const suggestions: Suggestion[] = [];
    const current = weather.current;
    const today = weather.forecast.forecastday[0].day;
    const isDay = current.is_day === 1;

    // Temperature-based suggestions
    if (current.temp_c > 30) {
      suggestions.push({
        icon: <Sun className="w-5 h-5 text-yellow-400" />,
        title: "High Temperature Alert",
        text: "Stay hydrated and avoid direct sun exposure. Consider indoor activities during peak hours.",
        color: "text-yellow-400",
        priority: "high"
      });
    } else if (current.temp_c < 10) {
      suggestions.push({
        icon: <ThermometerSun className="w-5 h-5 text-blue-400" />,
        title: "Cold Weather Alert",
        text: "Bundle up with warm layers. Consider wearing thermal clothing if going outside.",
        color: "text-blue-400",
        priority: "high"
      });
    }

    // Wind suggestions
    if (current.wind_kph > 30) {
      suggestions.push({
        icon: <Wind className="w-5 h-5 text-purple-400" />,
        title: "Strong Winds",
        text: "Strong winds expected. Secure outdoor items and be cautious when driving.",
        color: "text-purple-400",
        priority: "high"
      });
    } else if (current.wind_kph > 20) {
      suggestions.push({
        icon: <Wind className="w-5 h-5 text-gray-400" />,
        title: "Moderate Winds",
        text: "Moderate winds present. Perfect for flying kites or wind-related activities.",
        color: "text-gray-400",
        priority: "medium"
      });
    }

    // Rain probability
    if (today.daily_chance_of_rain > 70) {
      suggestions.push({
        icon: <Umbrella className="w-5 h-5 text-blue-400" />,
        title: "High Rain Chance",
        text: "High probability of rain. Don't forget your umbrella and waterproof gear.",
        color: "text-blue-400",
        priority: "high"
      });
    }

    // Humidity-based suggestions
    if (current.humidity > 80) {
      suggestions.push({
        icon: <Droplets className="w-5 h-5 text-blue-400" />,
        title: "High Humidity",
        text: "High humidity levels. Stay hydrated and wear breathable clothing.",
        color: "text-blue-400",
        priority: "medium"
      });
    } else if (current.humidity < 30) {
      suggestions.push({
        icon: <Droplets className="w-5 h-5 text-yellow-400" />,
        title: "Low Humidity",
        text: "Low humidity levels. Consider using a humidifier and moisturize your skin.",
        color: "text-yellow-400",
        priority: "medium"
      });
    }

    // UV index suggestions
    if (current.uv >= 8 && isDay) {
      suggestions.push({
        icon: <Sun className="w-5 h-5 text-red-400" />,
        title: "Extreme UV Index",
        text: "Very high UV levels. Apply strong sunscreen and limit sun exposure.",
        color: "text-red-400",
        priority: "high"
      });
    } else if (current.uv >= 5 && isDay) {
      suggestions.push({
        icon: <Sun className="w-5 h-5 text-orange-400" />,
        title: "Moderate UV Index",
        text: "Moderate UV levels. Apply sunscreen and wear protective clothing.",
        color: "text-orange-400",
        priority: "medium"
      });
    }

    // Temperature variation suggestions
    if (today.maxtemp_c - today.mintemp_c > 15) {
      suggestions.push({
        icon: <Shirt className="w-5 h-5 text-purple-400" />,
        title: "Large Temperature Variation",
        text: "Large temperature swings expected. Dress in layers for comfort throughout the day.",
        color: "text-purple-400",
        priority: "medium"
      });
    }

    // Activity suggestions based on weather
    if (isDay && current.temp_c >= 15 && current.temp_c <= 25 && current.humidity < 70 && today.daily_chance_of_rain < 30) {
      suggestions.push({
        icon: <Activity className="w-5 h-5 text-green-400" />,
        title: "Perfect for Outdoor Activities",
        text: "Ideal weather conditions for outdoor activities and exercise.",
        color: "text-green-400",
        priority: "low"
      });
    }

    // Sort suggestions by priority
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      medium: 1,
      low: 2
    };

    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const suggestions = getSuggestions();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#111111] rounded-3xl p-6 backdrop-blur-xl border border-white/5 shadow-2xl hover:bg-[#161616] transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h3 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Weather Insights
        </h3>
      </div>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[#1A1A1A] rounded-2xl p-4 backdrop-blur-lg border border-white/5 hover:bg-[#202020] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={suggestion.color}>
                {suggestion.icon}
              </div>
              <h4 className="font-medium text-white/90">
                {suggestion.title}
              </h4>
            </div>
            <p className="text-sm text-white/70 ml-8">
              {suggestion.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 