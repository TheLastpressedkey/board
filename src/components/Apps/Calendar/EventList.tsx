import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Event } from './types';
import { EventForm } from './EventForm';

interface EventListProps {
  events: Event[];
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (event: Event) => void;
  calendarHeight?: number;
  themeColors: any;
  isTerminalTheme: boolean;
}

export function EventList({ events, onDeleteEvent, onUpdateEvent, calendarHeight, themeColors, isTerminalTheme }: EventListProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current && calendarHeight) {
      listRef.current.style.height = `${calendarHeight}px`;
    }
  }, [calendarHeight]);

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date} ${time}`);
    return eventDate.toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const bgItem = isTerminalTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 65, 81, 0.5)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(209, 213, 219)';
  const textSecondary = isTerminalTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(75, 85, 99, 0.5)';
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(75, 85, 99, 0.5)';

  return (
    <>
      <div
        className="rounded-lg flex flex-col min-h-0"
        ref={listRef}
        style={{ backgroundColor: bgHeader }}
      >
        <h3
          className="text-lg font-semibold px-4 py-3"
          style={{ color: textColor, borderBottom: `1px solid ${borderColor}` }}
        >
          Events
        </h3>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 card-scrollbar">
          {sortedEvents.map(event => (
            <div
              key={event.id}
              className="rounded-lg p-3 group transition-colors"
              style={{
                backgroundColor: bgItem,
                border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium" style={{ color: textColor }}>{event.title}</h4>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-1 rounded-full"
                  >
                    <Pencil className="w-4 h-4" style={{ color: textMuted }} />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-1 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm mb-2" style={{ color: textMuted }}>
                {formatDate(event.date, event.time)}
              </p>

              {event.description && (
                <p className="text-sm line-clamp-2" style={{ color: textSecondary }}>
                  {event.description}
                </p>
              )}
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-center py-4" style={{ color: textSecondary }}>
              No events scheduled
            </p>
          )}
        </div>
      </div>

      {editingEvent && (
        <EventForm
          selectedDate={new Date(editingEvent.date)}
          event={editingEvent}
          onSubmit={(updatedEvent) => {
            onUpdateEvent(updatedEvent);
            setEditingEvent(null);
          }}
          onClose={() => setEditingEvent(null)}
          themeColors={themeColors}
          isTerminalTheme={isTerminalTheme}
        />
      )}
    </>
  );
}