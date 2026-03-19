import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { AppHeader } from '../../Common/Headers/AppHeader';

interface ClockProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export function Clock({ onClose, onDragStart, onTogglePin, isPinned }: ClockProps) {
  const [time, setTime] = useState(new Date());
  const [clockSize, setClockSize] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateClockSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const size = Math.min(containerWidth - 40, containerHeight - 40, 400);
        setClockSize(Math.max(size, 150));
      }
    };

    updateClockSize();
    
    const resizeObserver = new ResizeObserver(updateClockSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  const radius = clockSize / 2 - 10;
  const center = clockSize / 2;

  const clockColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const bgOverlay = isTerminalTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
  const iconColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="absolute top-2 left-0 right-0 z-10 px-2">
        <AppHeader
          onClose={onClose}
          onDragStart={onDragStart}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          backgroundColor={bgOverlay}
          borderColor="transparent"
          textColor={iconColor}
          className="rounded-lg"
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg 
          width={clockSize} 
          height={clockSize} 
          viewBox={`0 0 ${clockSize} ${clockSize}`} 
          className="transform cursor-grab active:cursor-grabbing"
          onMouseDown={onDragStart}
        >
          <circle
            cx={center}
            cy={center}
            r={radius * 0.95}
            fill={isTerminalTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
            stroke={clockColor}
            strokeWidth={clockSize / 100}
          />
          
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - 90;
            const hourNumber = i === 0 ? 12 : i;
            const x1 = center + (radius * 0.8) * Math.cos(angle * Math.PI / 180);
            const y1 = center + (radius * 0.8) * Math.sin(angle * Math.PI / 180);
            const x2 = center + (radius * 0.85) * Math.cos(angle * Math.PI / 180);
            const y2 = center + (radius * 0.85) * Math.sin(angle * Math.PI / 180);
            const textX = center + (radius * 0.7) * Math.cos(angle * Math.PI / 180);
            const textY = center + (radius * 0.7) * Math.sin(angle * Math.PI / 180);
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={clockColor}
                  strokeWidth={clockSize / 65}
                />
                <text
                  x={textX}
                  y={textY + clockSize / 40}
                  textAnchor="middle"
                  fill={clockColor}
                  fontSize={clockSize / 14}
                  fontWeight="bold"
                >
                  {hourNumber}
                </text>
              </g>
            );
          })}

          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 !== 0) {
              const angle = (i * 6) - 90;
              const x1 = center + (radius * 0.87) * Math.cos(angle * Math.PI / 180);
              const y1 = center + (radius * 0.87) * Math.sin(angle * Math.PI / 180);
              const x2 = center + (radius * 0.9) * Math.cos(angle * Math.PI / 180);
              const y2 = center + (radius * 0.9) * Math.sin(angle * Math.PI / 180);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={clockColor}
                  strokeWidth={clockSize / 200}
                  opacity="0.5"
                />
              );
            }
            return null;
          })}

          <line
            x1={center}
            y1={center}
            x2={center + (radius * 0.5) * Math.cos((hourAngle - 90) * Math.PI / 180)}
            y2={center + (radius * 0.5) * Math.sin((hourAngle - 90) * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth={clockSize / 33}
            strokeLinecap="round"
          />

          <line
            x1={center}
            y1={center}
            x2={center + (radius * 0.7) * Math.cos((minuteAngle - 90) * Math.PI / 180)}
            y2={center + (radius * 0.7) * Math.sin((minuteAngle - 90) * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth={clockSize / 50}
            strokeLinecap="round"
          />

          <line
            x1={center}
            y1={center}
            x2={center + (radius * 0.8) * Math.cos((secondAngle - 90) * Math.PI / 180)}
            y2={center + (radius * 0.8) * Math.sin((secondAngle - 90) * Math.PI / 180)}
            stroke="red"
            strokeWidth={clockSize / 100}
            strokeLinecap="round"
          />

          <circle
            cx={center}
            cy={center}
            r={clockSize / 25}
            fill={clockColor}
          />
        </svg>
      </div>
    </div>
  );
}