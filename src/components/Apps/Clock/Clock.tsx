import React, { useState, useEffect } from 'react';
import { X, Clock as ClockIcon } from 'lucide-react';

interface ClockProps {
  onClose: () => void;
}

export function Clock({ onClose }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
        <span className="text-sm font-medium text-gray-300">Clock</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Clock Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8">
          <ClockIcon className="w-16 h-16 text-pink-500" />
        </div>
        <div className="text-6xl font-mono text-white mb-4">
          {hours}:{minutes}:{seconds}
        </div>
        <div className="text-lg text-gray-400">
          {date}
        </div>
      </div>
    </div>
  );
}
