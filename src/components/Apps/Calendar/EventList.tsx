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
}

export function EventList({ events, onDeleteEvent, onUpdateEvent, calendarHeight, themeColors }: EventListProps) {
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

  return (
    <>
      <div 
        className="rounded-lg flex flex-col min-h-0" 
        ref={listRef}
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <h3 className="text-lg font-semibold text-white px-4 py-3 border-b border-gray-700/50">
          Events
        </h3>
        
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 card-scrollbar">
          {sortedEvents.map(event => (
            <div
              key={event.id}
              className="bg-gray-700/50 rounded-lg p-3 group hover:bg-gray-600/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{event.title}</h4>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-1 hover:bg-gray-500/50 rounded-full"
                  >
                    <Pencil className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-1 hover:bg-gray-500/50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">
                {formatDate(event.date, event.time)}
              </p>
              
              {event.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-center text-gray-400 py-4">
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
        />
      )}
    </>
  );
}