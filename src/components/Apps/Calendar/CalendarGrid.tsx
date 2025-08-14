import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Event } from './types';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from './utils';

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  themeColors: any;
}

export function CalendarGrid({ 
  currentDate, 
  events, 
  onSelectDate, 
  selectedDate,
  themeColors 
}: CalendarGridProps) {
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => 
    new Date(0, 0, i).toLocaleString('default', { weekday: 'short' })
  );

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="rounded-lg p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }, (_, i) => {
          const dayOffset = i - firstDayOfMonth;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOffset + 1);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dayEvents = getEventsForDate(date);
          const isHovered = hoveredDate === i;

          return (
            <div
              key={i}
              className={`
                relative aspect-square rounded-lg transition-all duration-200
                ${isCurrentMonth ? 'hover:bg-gray-700' : 'opacity-30'}
                ${isToday ? 'bg-opacity-20' : ''}
                ${isSelected ? 'bg-opacity-40 ring-2' : ''}
                ${!isCurrentMonth && 'pointer-events-none'}
                group
              `}
              style={{
                backgroundColor: isToday || isSelected ? themeColors.primary : undefined,
                borderColor: isSelected ? themeColors.primary : undefined
              }}
              onMouseEnter={() => setHoveredDate(i)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <button
                onClick={() => onSelectDate(date)}
                className="w-full h-full p-2 flex flex-col items-center justify-start"
              >
                <span className={`
                  text-sm font-medium
                  ${isToday || isSelected ? 'text-white' : 'text-gray-300'}
                `}>
                  {date.getDate()}
                </span>
                
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: themeColors.primary }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs" style={{ color: themeColors.primary }}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Add Event Button (appears on hover) */}
              {isCurrentMonth && isHovered && (
                <button
                  onClick={() => onSelectDate(date)}
                  className="absolute top-1 right-1 p-1 rounded-full text-white transform transition-all duration-200"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}