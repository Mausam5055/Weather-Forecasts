import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TemperatureCurveProps {
  hourlyData: {
    time: string;
    temp_c: number;
  }[];
  darkMode: boolean;
}

export const TemperatureCurve: React.FC<TemperatureCurveProps> = ({ hourlyData, darkMode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const width = 800;
  const height = 200;
  const mobileHeight = 160;
  const padding = isMobile ? 30 : 40;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter data points for mobile view (show every 3 hours)
  const filteredData = isMobile 
    ? hourlyData.filter((_, index) => index % 3 === 0)
    : hourlyData;

  // Get min and max temperatures for scaling
  const temperatures = filteredData.map(hour => hour.temp_c);
  const minTemp = Math.min(...temperatures) - 1;
  const maxTemp = Math.max(...temperatures) + 1;

  // Create points for the curve
  const points = filteredData.map((hour, index) => {
    const x = (index * (width - 2 * padding)) / (filteredData.length - 1) + padding;
    const y = (isMobile ? mobileHeight : height) - 
      (((hour.temp_c - minTemp) / (maxTemp - minTemp)) * ((isMobile ? mobileHeight : height) - 2 * padding) + padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl p-3 md:p-6 backdrop-blur-xl shadow-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#161616] transition-all duration-300">
      <h2 className="text-base md:text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 md:mb-6 px-2">
        Temperature Curve
      </h2>
      <div className="relative overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${isMobile ? mobileHeight : height}`}
          preserveAspectRatio="none"
          className="overflow-visible h-[160px] md:h-[200px]"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={darkMode ? "#a78bfa" : "#8b5cf6"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={darkMode ? "#ec4899" : "#db2777"} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Grid lines - Fewer lines on mobile */}
          {[...Array(isMobile ? 4 : 6)].map((_, i) => (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={i * ((isMobile ? mobileHeight : height) - 2 * padding) / (isMobile ? 3 : 5) + padding}
              x2={width - padding}
              y2={i * ((isMobile ? mobileHeight : height) - 2 * padding) / (isMobile ? 3 : 5) + padding}
              stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              strokeDasharray="4,4"
              className="transition-all duration-300"
            />
          ))}

          {/* Temperature curve */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={`M ${points}`}
            fill="none"
            stroke="url(#gradient-stroke)"
            strokeWidth={isMobile ? 2 : 3}
            className="drop-shadow-lg"
          />

          {/* Area under the curve */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            d={`M ${padding},${isMobile ? mobileHeight : height} ${points} ${width - padding},${isMobile ? mobileHeight : height} Z`}
            fill="url(#gradient)"
            className="opacity-50"
          />

          {/* Temperature points */}
          {filteredData.map((hour, index) => {
            const x = (index * (width - 2 * padding)) / (filteredData.length - 1) + padding;
            const y = (isMobile ? mobileHeight : height) - 
              (((hour.temp_c - minTemp) / (maxTemp - minTemp)) * ((isMobile ? mobileHeight : height) - 2 * padding) + padding);
            
            return (
              <g key={index}>
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  cx={x}
                  cy={y}
                  r={isMobile ? 3 : 4}
                  className="fill-purple-400 dark:fill-purple-500"
                />
                
                {/* Temperature labels */}
                <motion.text
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  x={x}
                  y={y - (isMobile ? 10 : 15)}
                  textAnchor="middle"
                  className="fill-gray-600 dark:fill-gray-400 text-[9px] md:text-xs font-medium"
                >
                  {Math.round(hour.temp_c)}°
                </motion.text>
                
                {/* Time labels */}
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  x={x}
                  y={(isMobile ? mobileHeight : height) - (isMobile ? 6 : 10)}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400 text-[8px] md:text-xs"
                >
                  {new Date(hour.time).getHours()}:00
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}; 