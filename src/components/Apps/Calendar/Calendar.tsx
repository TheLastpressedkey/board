import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { useCalendar } from './useCalendar';
import { useTheme } from '../../../contexts/ThemeContext';
import { Event } from './types';

interface CalendarProps {
  onClose: () => void;
  metadata?: { events?: Event[] };
  onDataChange?: (data: { events: Event[] }) => void;
}

export function Calendar({ onClose, metadata, onDataChange }: CalendarProps) {
  const { themeColors } = useTheme();
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
    updateEvent
  } = useCalendar(metadata?.events || []);

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

  return (
    <div 
      className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden" 
      ref={containerRef}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center px-4 py-2"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <span className="text-sm font-medium text-gray-300">Calendar</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        <div 
          className="flex-1 flex flex-col min-h-0" 
          ref={calendarRef}
          style={{ backgroundColor: themeColors.menuBg }}
        >
          <CalendarHeader
            currentDate={currentDate}
            onNavigate={navigateMonth}
            themeColors={themeColors}
          />
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onSelectDate={handleDateSelect}
            selectedDate={selectedDate}
            themeColors={themeColors}
          />
        </div>
        
        {showSidebar && (
          <div 
            className="w-[280px] flex-shrink-0 flex flex-col min-h-0"
            style={{ backgroundColor: themeColors.menuBg }}
          >
            <EventList
              events={events}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
              calendarHeight={calendarRef.current?.clientHeight}
              themeColors={themeColors}
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
        />
      )}
    </div>
  );
}