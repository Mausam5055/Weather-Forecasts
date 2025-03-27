import React, { useState, useEffect } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { WeeklyForecast } from './components/WeeklyForecast';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Home } from './components/Home';
import { AISuggestions } from './components/AISuggestions';
import { ThemeToggle } from './components/ThemeToggle';
import { WeatherData } from './types/weather';
import { Loader2 } from 'lucide-react';
import './styles/scrollbar.css';

// Replace this with your new API key from weatherapi.com
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_BASE_URL = 'https://api.weatherapi.com/v1';

if (!API_KEY) {
  console.error('Missing VITE_WEATHER_API_KEY environment variable. Please add it to your .env file.');
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('weatherAppVisited');
  });
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Update document class and localStorage when theme changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (weather) {
        setWeather(null);
        setError(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [weather]);

  const handleBackToHome = () => {
    setWeather(null);
    setError(null);
    window.history.pushState({}, '', '/');
  };

  const fetchWeather = async (query: string, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      setLoading(true);
      setError(null);

      // Add error handling for empty API key
      if (!API_KEY) {
        throw new Error('Please add your WeatherAPI.com API key in your .env file');
      }

      const response = await fetch(
        `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=yes`
      );
      
      if (response.status === 403) {
        throw new Error('Invalid API key. Please check your WeatherAPI.com API key.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'City not found');
      }

      const data = await response.json();
      setWeather(data);
      localStorage.setItem('lastLocation', query);
      setShowWelcome(false);
      localStorage.setItem('weatherAppVisited', 'true');
      
      // Push new state to history when weather data is loaded
      window.history.pushState({ weather: true }, '', '/weather');
    } catch (err) {
      console.error('Weather API Error:', err);
      
      // Retry logic for network errors or 5xx server errors
      if (retryCount < MAX_RETRIES && 
          (err instanceof TypeError || (err instanceof Error && err.message.includes('500')))) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWeather(query, retryCount + 1);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        const lastLocation = localStorage.getItem('lastLocation') || 'London';
        fetchWeather(lastLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Auto-refresh weather data every 30 minutes if we have a location
  useEffect(() => {
    if (weather) {
      const refreshInterval = Number(import.meta.env.VITE_WEATHER_REFRESH_INTERVAL) || 30;
      const refreshIntervalMs = refreshInterval * 60 * 1000;

      const refreshIntervalId = setInterval(() => {
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation) {
          fetchWeather(lastLocation);
        }
      }, refreshIntervalMs);

      return () => clearInterval(refreshIntervalId);
    }
  }, [weather]);

  const getAirQualityStatus = (airQuality: WeatherData['current']['air_quality']) => {
    const index = airQuality?.['us-epa-index'] ?? 0;
    if (index <= 2) return 'Low';
    if (index <= 4) return 'Moderate';
    return 'High';
  };

  // Show welcome screen on first visit
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} onSearch={fetchWeather} />;
  }

  // Show home screen when searching or on error
  if (!weather || error) {
    return <Home onSearch={fetchWeather} onUseLocation={handleGetStarted} />;
  }

  // Show weather dashboard
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100/50 via-white to-pink-100/50 dark:from-purple-900/10 dark:via-black dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative">
        {/* Navigation Bar - Responsive */}
        <div className="w-full bg-white/80 dark:bg-black/20 border-b border-gray-200 dark:border-white/5 backdrop-blur-lg">
          <div className="container mx-auto px-4 md:px-6 py-4 max-w-7xl">
            {/* Mobile View */}
            <div className="md:hidden">
              <div className="flex flex-col space-y-4">
                {/* Brand Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/50 dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        className="w-6 h-6"
                        strokeWidth="2"
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#a78bfa' }} />
                            <stop offset="100%" style={{ stopColor: '#ec4899' }} />
                          </linearGradient>
                        </defs>
                        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        <path d="M16 16v0a3 3 0 003-3v-1a3 3 0 00-3-3v0" />
                        <path d="M8 16v0a3 3 0 01-3-3v-1a3 3 0 013-3v0" />
                      </svg>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Weather ForeCasts
                    </h1>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="flex items-center gap-3">
                    {/* Theme Toggle Button */}
                    <button
                      onClick={toggleTheme}
                      className="group bg-white/50 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/40 p-2 rounded-lg text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                    >
                      {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                    </button>

                    {/* Refresh Button */}
                    {weather && (
                      <button 
                        onClick={() => fetchWeather(weather.location.name)}
                        className="group bg-white/50 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/40 p-2 rounded-lg text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-2 bg-white/50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="w-7 h-7 text-purple-400"
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path d="M16 16v0a3 3 0 003-3v-1a3 3 0 00-3-3v0" />
                    <path d="M8 16v0a3 3 0 01-3-3v-1a3 3 0 013-3v0" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Weather ForeCasts
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-white/40">Your Daily Weather Companion</p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-6">
                <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
                {weather && (
                  <div className="flex items-center gap-5">
                    {/* Last Updated Status */}
                    <div className="text-sm text-gray-600 dark:text-white/60 flex items-center gap-2 bg-white/30 dark:bg-black/30 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-purple-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Updated {new Date(weather.current.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Refresh Button */}
                    <button 
                      onClick={() => fetchWeather(weather.location.name)}
                      className="group bg-white/30 dark:bg-black/30 hover:bg-white/40 dark:hover:bg-black/40 px-4 py-2 rounded-full text-sm text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Centered Location Header for Both Mobile and Desktop */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {weather.location.name}
                </h1>
                <div className="text-lg md:text-2xl text-gray-600 dark:text-white/60 mt-1">
                  {weather.location.country}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-white/60 text-base md:text-base bg-white/50 dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 hover:bg-white/60 dark:hover:bg-[#202020] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-yellow-500 dark:text-yellow-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Max: {Math.round(weather.forecast.forecastday[0].day.maxtemp_c)}°
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-white/60 text-base md:text-base bg-white/50 dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 hover:bg-white/60 dark:hover:bg-[#202020] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-blue-500 dark:text-blue-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12l-6.172-6.172a4 4 0 00-5.656 0L2 12m0 0l6.172 6.172a4 4 0 005.656 0L20 12m0 0l-2.172-2.172M20 12l-2.172 2.172" />
                    </svg>
                    Min: {Math.round(weather.forecast.forecastday[0].day.mintemp_c)}°
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-white/60 text-base md:text-base bg-white/50 dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 hover:bg-white/60 dark:hover:bg-[#202020] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-purple-500 dark:text-purple-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(weather.location.localtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-white/60 text-base md:text-base bg-white/50 dark:bg-[#1A1A1A] px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 hover:bg-white/60 dark:hover:bg-[#202020] transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-pink-500 dark:text-pink-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {weather.location.tz_id.split('/')[1].replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="md:grid md:grid-cols-12 md:gap-6">
                {/* Left Column - Main Weather */}
                <div className="md:col-span-8 space-y-6">
                  {/* Main Weather Card */}
                  <WeatherCard weather={weather} />
                  
                  {/* Search Another City - Mobile Only */}
                  <div className="block md:hidden">
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Search Another City
                      </h2>
                      <div className="flex flex-col gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter city name..."
                            className="w-full bg-white/5 dark:bg-black/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-white/40 border border-gray-200 dark:border-white/10 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                fetchWeather((e.target as HTMLInputElement).value);
                              }
                            }}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-white/40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              fetchWeather(`${latitude},${longitude}`);
                            },
                            (error) => {
                              console.error('Geolocation Error:', error);
                              const lastLocation = localStorage.getItem('lastLocation') || 'London';
                              fetchWeather(lastLocation);
                            }
                          )}
                          className="bg-gradient-to-r from-purple-400/10 to-pink-400/10 hover:from-purple-400/20 hover:to-pink-400/20 px-4 py-3 rounded-xl text-gray-900 dark:text-white flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Use My Location</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search Another City - Desktop Only */}
                  <div className="hidden md:block">
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Search Another City
                      </h2>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Enter city name..."
                            className="w-full bg-white/5 dark:bg-black/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-white/40 border border-gray-200 dark:border-white/10 focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                fetchWeather((e.target as HTMLInputElement).value);
                              }
                            }}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-white/40">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              fetchWeather(`${latitude},${longitude}`);
                            },
                            (error) => {
                              console.error('Geolocation Error:', error);
                              const lastLocation = localStorage.getItem('lastLocation') || 'London';
                              fetchWeather(lastLocation);
                            }
                          )}
                          className="bg-gradient-to-r from-purple-400/10 to-pink-400/10 hover:from-purple-400/20 hover:to-pink-400/20 px-4 py-3 rounded-xl text-gray-900 dark:text-white flex items-center gap-2 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Use My Location</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Weather Alerts & Notifications - Desktop Only */}
                  <div className="hidden md:block">
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Weather Alerts
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-yellow-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white/90">UV Index Alert</h3>
                            <p className="text-sm text-gray-600 dark:text-white/60">High UV levels expected between 10 AM - 4 PM. Take necessary precautions.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-blue-500">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white/90">Weather Update</h3>
                            <p className="text-sm text-gray-600 dark:text-white/60">Perfect conditions for outdoor activities in the afternoon.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Comparison - Desktop Only */}
                  <div className="hidden md:block">
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        Temperature Trends
                      </h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-1">Yesterday</div>
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(weather.forecast.forecastday[0].day.maxtemp_c - 2)}°</div>
                          <div className="text-sm text-gray-400 dark:text-white/40">High</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-1">Today</div>
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(weather.forecast.forecastday[0].day.maxtemp_c)}°</div>
                          <div className="text-sm text-gray-400 dark:text-white/40">High</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-1">Tomorrow</div>
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(weather.forecast.forecastday[1].day.maxtemp_c)}°</div>
                          <div className="text-sm text-gray-400 dark:text-white/40">High</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Tips Card */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                      Weather Tips
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white/90">Outdoor Activity</h3>
                          <p className="text-sm text-gray-600 dark:text-white/60 mt-1">Great conditions for walking or cycling</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-purple-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white/90">Air Quality</h3>
                          <p className="text-sm text-gray-600 dark:text-white/60 mt-1">Fresh air, perfect for ventilation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-yellow-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white/90">UV Protection</h3>
                          <p className="text-sm text-gray-600 dark:text-white/60 mt-1">Moderate UV levels, use sunscreen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white/90">Wind Advisory</h3>
                          <p className="text-sm text-gray-600 dark:text-white/60 mt-1">Light breeze, ideal for outdoor dining</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hourly Forecast - Mobile Only */}
                  <div className="md:hidden">
                    <HourlyForecast 
                      forecast={weather.forecast.forecastday[0].hour.map(hour => ({
                        time: hour.time,
                        temp_c: hour.temp_c,
                        condition: hour.condition,
                        chance_of_rain: hour.chance_of_rain,
                        humidity: hour.humidity,
                        wind_kph: hour.wind_kph,
                        feelslike_c: hour.feelslike_c
                      }))}
                    />
                  </div>

                  {/* Weekly Forecast - Mobile Only */}
                  <div className="md:hidden">
                    <WeeklyForecast forecast={weather.forecast.forecastday} />
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="md:col-span-4 space-y-6 mt-8 md:mt-0">
                  {/* AI Suggestions */}
                  <AISuggestions weather={weather} />

                  {/* Air Quality and UV Index Combined Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Air Quality Card */}
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Air Quality
                        </h3>
                      </div>
                      <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                        {getAirQualityStatus(weather.current.air_quality)} Health Risk
                      </div>
                    </div>

                    {/* UV Index Card */}
                    <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                      <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        UV Index
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {weather.current.uv}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-white/60 mt-2">
                        {weather.current.uv <= 2 ? 'Low' : 
                         weather.current.uv <= 5 ? 'Moderate' : 'High'}
                      </div>
                    </div>
                  </div>

                  {/* Sunrise/Sunset Card */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                    <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      Sun Schedule
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Sunrise</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.forecast.forecastday[0].astro.sunrise}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Sunset</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.forecast.forecastday[0].astro.sunset}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather & Wind Details Combined Card */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                    <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                      Weather & Wind Details
                    </div>
                    <div className="space-y-6">
                      {/* Wind Direction and Speed */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-white/60">Wind Direction</div>
                              <div className="text-lg font-semibold">{weather.current.wind_dir}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{weather.current.wind_degree}°</div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-white/60">Wind Speed</div>
                              <div className="text-lg font-semibold">{weather.current.wind_kph} km/h</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 dark:text-white/40">
                            Gusts up to {weather.current.gust_kph} km/h
                          </div>
                        </div>
                      </div>

                      {/* Weather Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Humidity</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.humidity}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Feels Like</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.feelslike_c}°
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Visibility</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.vis_km} km
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Pressure</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.pressure_mb} mb
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Cloud Cover</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.cloud}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Precipitation</div>
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {weather.current.precip_mm} mm
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Moon Phase Card */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                    <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      Moon Phase
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Current Phase</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.forecast.forecastday[0].astro.moon_phase}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Illumination</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.forecast.forecastday[0].astro.moon_illumination}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visibility and Pressure Card */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
                    <div className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      Additional Conditions
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Visibility</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.current.vis_km} km
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Pressure</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.current.pressure_mb} mb
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Cloud Cover</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.current.cloud}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Gust Speed</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weather.current.gust_kph} km/h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly and Weekly Forecast - Desktop Only */}
              <div className="hidden md:block space-y-6 mt-6">
                {/* Today's Hourly Forecast */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 text-gray-900 dark:text-white backdrop-blur-lg border border-gray-200 dark:border-white/5 shadow-2xl">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    Today's Forecast
                  </h2>
                  <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar horizontal-scroll touch-pan-x">
                    {weather.forecast.forecastday[0].hour.map((hour, index) => (
                      <div key={index} className="flex-shrink-0 w-20 text-center">
                        <div className="text-sm text-gray-600 dark:text-white/60 mb-1">
                          {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-2xl mb-1">
                          {Math.round(hour.temp_c)}°
                        </div>
                        <img 
                          src={hour.condition.icon} 
                          alt={hour.condition.text}
                          className="w-12 h-12 mx-auto mb-1"
                        />
                        <div className="text-sm text-gray-600 dark:text-white/60">
                          {hour.chance_of_rain}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Forecast */}
                <WeeklyForecast forecast={weather.forecast.forecastday} />
              </div>

              {/* Footer */}
              <footer className="relative mt-12">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-800/5 via-gray-200 dark:via-gray-800/25 to-transparent pointer-events-none" />
                
                <div className="relative border-t border-gray-200 dark:border-white/5">
                  <div className="container mx-auto px-4 py-12">
                    {/* Footer Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                      {/* Brand Section */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Weather ForeCasts
                        </h3>
                        <p className="text-gray-600 dark:text-white/60 text-base leading-relaxed">
                          Your Daily Weather Companion, providing accurate forecasts and intelligent weather insights to help you plan your day better.
                        </p>
                      </div>

                      {/* Quick Links */}
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white/80">
                          Quick Links
                        </h3>
                        <div className="flex flex-col space-y-2">
                          <a href="#" className="text-gray-600 dark:text-white/60 hover:text-gray-900 transition-colors text-base">Home</a>
                          <a 
                            href="https://mausam03.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-600 dark:text-white/60 hover:text-gray-900 transition-colors text-base flex items-center gap-2 group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 group-hover:text-purple-400 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 6.364-15.364M12 12h.01M8 12h.01M16 12h.01" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h.01M12 3v.01M21 12h.01M12 21v.01" />
                            </svg>
                            Portfolio
                          </a>
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 dark:text-white/80">
                          Connect With Us
                        </h3>
                        <div className="flex flex-col space-y-2">
                          <a 
                            href="mailto:rikikumkar@gmail.com"
                            className="text-gray-600 dark:text-white/60 hover:text-gray-900 transition-colors text-base flex items-center gap-2 group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 group-hover:text-purple-400 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            rikikumkar@gmail.com
                          </a>
                          <a 
                            href="https://github.com/Mausam5055"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-white/60 hover:text-gray-900 transition-colors text-base flex items-center gap-2 group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 group-hover:text-purple-400 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                            GitHub
                          </a>
                          <a 
                            href="https://www.linkedin.com/in/mausam-kar-6388861a7/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-white/60 hover:text-gray-900 transition-colors text-base flex items-center gap-2 group"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 group-hover:text-purple-400 transition-colors">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 1 0 0-4" />
                            </svg>
                            LinkedIn
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-200 dark:border-white/5">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Author Info with Photo */}
                        <div className="flex items-center gap-3 order-2 md:order-1">
                          <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                            
                            {/* Photo Container */}
                            <div className="relative bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                              <img
                                src="/avatar.jpg"
                                alt="Mausam Kar"
                                className="w-12 h-12 object-cover"
                              />
                            </div>
                          </div>
                          <div className="text-gray-600 dark:text-white/60 text-base">
                            Created with <span className="text-red-500">❤️</span> by Mausam Kar
                          </div>
                        </div>

                        {/* Copyright */}
                        <div className="text-gray-600 dark:text-white/60 text-base text-center md:text-left order-1 md:order-2">
                          © {new Date().getFullYear()} Weather ForeCasts. All Rights Reserved
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;