import { Event, Comment, AppState } from '../types';

const STORAGE_KEY = 'call_sheet_state';

export const loadState = async (): Promise<AppState> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {}
    }
    return { 
        isUnlocked: localStorage.getItem('call_sheet_unlocked') === 'true', 
        events: [] 
    };
};

export const saveState = (state: AppState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const unlockApp = (): void => {
    localStorage.setItem('call_sheet_unlocked', 'true');
};

export const addEvent = async (event: Omit<Event, 'id' | 'comments'>): Promise<Event> => {
    const state = await loadState();
    const newEvent: Event = {
        ...event,
        id: Date.now().toString(),
        comments: []
    };
    state.events.push(newEvent);
    saveState(state);
    return newEvent;
};

export const deleteEvent = async (id: string): Promise<void> => {
    const state = await loadState();
    state.events = state.events.filter(e => e.id !== id);
    saveState(state);
};

export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    const state = await loadState();
    const event = state.events.find(e => e.id === id);
    if (event) {
        event.status = status;
        saveState(state);
    }
};

export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    const state = await loadState();
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
