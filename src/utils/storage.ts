import { Event, Comment, AppState } from '../types';

const PROXY_URL = 'https://call-api.nikiitsky.workers.dev';

async function api(path: string, options: RequestInit = {}) {
    const res = await fetch(`${PROXY_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export const loadState = async (): Promise<AppState> => {
    try {
        const [events, comments] = await Promise.all([
            api('/events?order=created_at.desc'),
            api('/comments?order=created_at')
        ]);
        
        return {
            isUnlocked: localStorage.getItem('call_sheet_unlocked') === 'true',
            events: events.map((e: any) => ({
                ...e,
                comments: (comments || []).filter((c: any) => c.event_id === e.id).map((c: any) => ({
                    id: c.id, author: c.author, text: c.text,
                    timestamp: new Date(c.created_at).getTime()
                }))
            }))
        };
    } catch (err) {
        console.error('API error:', err);
        return { isUnlocked: false, events: [] };
    }
};

export const unlockApp = () => localStorage.setItem('call_sheet_unlocked', 'true');

export const addEvent = async (event: Omit<Event, 'id' | 'comments'>): Promise<Event> => {
    const newEvent = { ...event, id: Date.now().toString() };
    await api('/events', { method: 'POST', body: JSON.stringify(newEvent) });
    return { ...newEvent, comments: [] };
};

export const deleteEvent = async (id: string): Promise<void> => {
    await api(`/events?id=eq.${id}`, { method: 'DELETE' });
};

export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    await api(`/events?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
};

export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    await api('/comments', { method: 'POST', body: JSON.stringify({
        id: Date.now().toString(), event_id: eventId, author, text
    })});
};

export const saveState = async (state: AppState): Promise<void> => {};
