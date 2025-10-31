import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Event } from './types';
import { generateEventId } from './utils';

interface EventFormProps {
  selectedDate: Date | null;
  onSubmit: (event: Event) => void;
  onClose: () => void;
  event?: Event;
  themeColors: any;
  isTerminalTheme: boolean;
}

export function EventForm({ selectedDate, onSubmit, onClose, event, themeColors, isTerminalTheme }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(
    event?.date || selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(event?.time || '12:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: Event = {
      id: event?.id || generateEventId(),
      title,
      description,
      date,
      time
    };

    onSubmit(newEvent);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const bgModal = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(31, 41, 55)';
  const bgInput = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(55, 65, 81)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(209, 213, 219)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
  const primaryColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;
  const hoverBg = isTerminalTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgb(55, 65, 81)';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{
          backgroundColor: bgModal,
          border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            {event ? 'Edit Event' : 'New Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none h-24"
              style={{
                backgroundColor: bgInput,
                color: textColor,
                border: `1px solid ${borderColor}`,
                '--tw-ring-color': primaryColor
              } as React.CSSProperties}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: bgInput,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-1" style={{ color: textMuted }}>
                Time
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: bgInput,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm"
              style={{ color: textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg"
              style={{
                backgroundColor: primaryColor,
                color: isTerminalTheme ? 'rgb(0, 0, 0)' : 'white'
              }}
            >
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}