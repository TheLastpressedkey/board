import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, GripHorizontal, X } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { useCalendar } from './useCalendar';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
import { Event } from './types';

interface CalendarProps {
  onClose: () => void;
  metadata?: { events?: Event[] };
  onDataChange?: (data: { events: Event[] }) => void;
  cardId?: string;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function Calendar({ onClose, metadata, onDataChange, cardId, onDragStart }: CalendarProps) {
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const {
    currentDate,
    events,
    navigateMonth,
    addEvent,
    deleteEvent,
    updateEvent,
    isLoaded
  } = useCalendar(metadata?.events || [], cardId);

  // Check container width and update sidebar visibility
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setShowSidebar(width >= 480); // Show sidebar only if width is >= 480px
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleAddEvent = (event: Event) => {
    addEvent(event);
    setShowEventForm(false);
    setSelectedDate(null);
    
    if (onDataChange) {
      onDataChange({ events: [...events, event] });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    
    if (onDataChange) {
      onDataChange({ events: events.filter(e => e.id !== eventId) });
    }
  };

  const handleUpdateEvent = (event: Event) => {
    updateEvent(event);
    
    if (onDataChange) {
      onDataChange({ events: events.map(e => e.id === event.id ? event : e) });
    }
  };

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(75, 85, 99, 0.5)';
  const iconColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden"
      ref={containerRef}
      style={{ backgroundColor: bgMain }}
    >
      {/* Header */}
      <div
        className="p-4"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <CalendarIcon
              className="w-5 h-5"
              style={{ color: iconColor }}
            />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: textMuted }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        <div
          className="flex-1 flex flex-col min-h-0"
          ref={calendarRef}
          style={{ backgroundColor: bgHeader }}
        >
          <CalendarHeader
            currentDate={currentDate}
            onNavigate={navigateMonth}
            themeColors={themeColors}
            isTerminalTheme={isTerminalTheme}
          />
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onSelectDate={handleDateSelect}
            selectedDate={selectedDate}
            themeColors={themeColors}
            isTerminalTheme={isTerminalTheme}
          />
        </div>

        {showSidebar && (
          <div
            className="w-[280px] flex-shrink-0 flex flex-col min-h-0"
            style={{ backgroundColor: bgHeader }}
          >
            <EventList
              events={events}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
              calendarHeight={calendarRef.current?.clientHeight}
              themeColors={themeColors}
              isTerminalTheme={isTerminalTheme}
            />
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          selectedDate={selectedDate}
          onSubmit={handleAddEvent}
          onClose={() => {
            setShowEventForm(false);
            setSelectedDate(null);
          }}
          themeColors={themeColors}
          isTerminalTheme={isTerminalTheme}
        />
      )}
    </div>
  );
}