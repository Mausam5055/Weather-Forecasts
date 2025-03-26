import React from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  isDay: boolean;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, isDay, className = "" }) => {
  const getWeatherIcon = () => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return isDay ? <Sun size={64} /> : <Moon size={64} />;
    }
    if (conditionLower.includes('cloud')) {
      return <Cloud size={64} />;
    }
    if (conditionLower.includes('rain')) {
      return <CloudRain size={64} />;
    }
    if (conditionLower.includes('snow')) {
      return <CloudSnow size={64} />;
    }
    if (conditionLower.includes('thunder')) {
      return <CloudLightning size={64} />;
    }
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return <CloudFog size={64} />;
    }
    if (conditionLower.includes('wind')) {
      return <Wind size={64} />;
    }
    
    return <Cloud size={64} />; // default to cloud
  };

  return (
    <div className={`${className} flex items-center justify-center text-white`}>
      {getWeatherIcon()}
    </div>
  );
}; 