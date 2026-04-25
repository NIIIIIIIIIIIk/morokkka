import { Event, AppState, DEFAULT_EVENTS } from '../types';

const STORAGE_KEY = 'call_sheet_state';

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  
  return {
    isUnlocked: false,
    events: DEFAULT_EVENTS
  };
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const unlockApp = (): void => {
  const state = loadState();
  state.isUnlocked = true;
  saveState(state);
};

export const addEvent = (event: Omit<Event, 'id' | 'comments'>): Event => {
  const state = loadState();
  const newEvent: Event = {
    ...event,
    id: Date.now().toString(),
    comments: []
  };
  state.events.push(newEvent);
  saveState(state);
  return newEvent;
};

export const deleteEvent = (id: string): void => {
  const state = loadState();
  state.events = state.events.filter(e => e.id !== id);
  saveState(state);
};

export const updateEventStatus = (id: string, status: Event['status']): void => {
  const state = loadState();
  const event = state.events.find(e => e.id === id);
  if (event) {
    event.status = status;
    saveState(state);
  }
};

export const addComment = (eventId: string, author: 'NIK' | 'ELINA', text: string): void => {
  const state = loadState();
  const event = state.events.find(e => e.id === eventId);
  if (event) {
    event.comments.push({
      id: Date.now().toString(),
      author,
      text,
      timestamp: Date.now()
    });
    saveState(state);
  }
};