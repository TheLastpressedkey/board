import { useState, useCallback, useEffect } from 'react';
import { Event } from './types';
import { appStoreDataService } from '../../../services/appStoreData';

export function useCalendar(initialEvents: Event[] = [], cardId?: string) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load events from database on mount
  useEffect(() => {
    const loadEvents = async () => {
      if (!cardId) {
        // Fallback to initialEvents if no cardId
        setEvents(initialEvents);
        setIsLoaded(true);
        return;
      }

      try {
        const data = await appStoreDataService.getAppData(cardId);
        if (data && data.events) {
          setEvents(data.events);
        } else {
          // Use initialEvents as fallback
          setEvents(initialEvents);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to initialEvents on error
        setEvents(initialEvents);
      } finally {
        setIsLoaded(true);
      }
    };

    loadEvents();
  }, [cardId]); // Only depend on cardId

  // Save events to database whenever they change
  const saveEvents = useCallback(async (newEvents: Event[]) => {
    if (!cardId || !isLoaded) return;

    try {
      const data = { events: newEvents };
      await appStoreDataService.saveAppData(cardId, 'calendar', data);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }, [cardId, isLoaded]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const addEvent = useCallback(async (event: Event) => {
    const newEvents = [...events, event];
    setEvents(newEvents);
    await saveEvents(newEvents);
  }, [events, saveEvents]);

  const updateEvent = useCallback(async (updatedEvent: Event) => {
    const newEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(newEvents);
    await saveEvents(newEvents);
  }, [events, saveEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const newEvents = events.filter(event => event.id !== eventId);
    setEvents(newEvents);
    await saveEvents(newEvents);
  }, [events, saveEvents]);

  return {
    currentDate,
    events,
    navigateMonth,
    addEvent,
    updateEvent,
    deleteEvent,
    isLoaded
  };
}