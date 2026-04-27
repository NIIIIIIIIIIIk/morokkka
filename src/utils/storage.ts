import { Event, Comment, AppState } from '../types';

const SUPABASE_URL = 'https://call-api.nikiitsky.workers.dev';
const SUPABASE_KEY = 'sb_publishable_DLRSW3kv4o9QoTVXjGVnYg_iWMNSCmX';

// Прокси URL с ключом в параметрах
function api(path: string, options: RequestInit = {}) {
    const url = `https://corsproxy.io/?${encodeURIComponent(
        `${SUPABASE_URL}${path}?apikey=${SUPABASE_KEY}`
    )}`;
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            ...options.headers
        }
    });
}

export const loadState = async (): Promise<AppState> => {
    try {
        const [eventsRes, commentsRes] = await Promise.all([
            api('/events?order=created_at.desc'),
            api('/comments?order=created_at')
        ]);
        
        const events = await eventsRes.json();
        const comments = await commentsRes.json();
        
        const eventsWithComments = events.map((e: any) => ({
            ...e,
            comments: comments
                .filter((c: any) => c.event_id === e.id)
                .map((c: any) => ({
                    id: c.id,
                    author: c.author,
                    text: c.text,
                    timestamp: new Date(c.created_at).getTime()
                }))
        }));
        
        return {
            isUnlocked: localStorage.getItem('call_sheet_unlocked') === 'true',
            events: eventsWithComments
        };
    } catch {
        return { isUnlocked: false, events: [] };
    }
};

export const unlockApp = () => localStorage.setItem('call_sheet_unlocked', 'true');

export const addEvent = async (event: Omit<Event, 'id' | 'comments'>): Promise<Event> => {
    const newEvent = { ...event, id: Date.now().toString() };
    await api('/events', {
        method: 'POST',
        body: JSON.stringify(newEvent)
    });
    return { ...newEvent, comments: [] };
};

export const deleteEvent = async (id: string): Promise<void> => {
    await api(`/events?id=eq.${id}`, { method: 'DELETE' });
};

export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    await api(`/events?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
};

export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    await api('/comments', {
        method: 'POST',
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
