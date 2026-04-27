import { Event, Comment, AppState } from '../types';

const API_URL = 'http://159.194.236.9:3001';

const headers = {
    'Content-Type': 'application/json'
};

export const loadState = async (): Promise<AppState> => {
    try {
        const [eventsRes, commentsRes] = await Promise.all([
            fetch(`${API_URL}/events`),
            fetch(`${API_URL}/comments`)
        ]);
        
        const events = await eventsRes.json();
        const comments = await commentsRes.json();
        
        const eventsWithComments = events.map((e: any) => ({
            id: e.id,
            date: e.date,
            scene: e.scene,
            location: e.location,
            status: e.status as Event['status'],
            notes: e.notes || '',
            addedBy: e.added_by as 'NIK' | 'ELINA',
            comments: comments
                .filter((c: any) => c.event_id === e.id)
                .map((c: any) => ({
                    id: c.id,
                    author: c.author as 'NIK' | 'ELINA',
                    text: c.text,
                    timestamp: new Date(c.created_at).getTime()
                }))
        }));
        
        return {
            isUnlocked: localStorage.getItem('call_sheet_unlocked') === 'true',
            events: eventsWithComments
        };
    } catch (err) {
        console.error('API error:', err);
        return { isUnlocked: false, events: [] };
    }
};

export const unlockApp = () => localStorage.setItem('call_sheet_unlocked', 'true');

export const addEvent = async (event: Omit<Event, 'id' | 'comments'>): Promise<Event> => {
    const newEvent = { ...event, id: Date.now().toString() };
    await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            id: newEvent.id,
            date: newEvent.date,
            scene: newEvent.scene,
            location: newEvent.location,
            status: newEvent.status,
            notes: newEvent.notes || '',
            added_by: newEvent.addedBy
        })
    });
    return { ...newEvent, comments: [] };
};

export const deleteEvent = async (id: string): Promise<void> => {
    await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
};

export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    await fetch(`${API_URL}/events/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
    });
};

export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            id: Date.now().toString(),
            event_id: eventId,
            author,
            text
        })
    });
};

export const saveState = async (state: AppState): Promise<void> => {
    localStorage.setItem('call_sheet_unlocked', String(state.isUnlocked));
};
