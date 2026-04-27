import { Event, Comment, AppState } from '../types';

const SUPABASE_URL = 'https://czskbxqkyggjbzuyedjm.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_DLRSW3kv4o9QoTVXjGVnYg_iWMNSCmX';

const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
};

// ============ СОБЫТИЯ ============
export const loadState = async (): Promise<AppState> => {
    try {
        const [eventsRes, commentsRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/events?order=created_at.desc`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/comments?order=created_at`, { headers })
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
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: 'POST', headers, body: JSON.stringify(newEvent)
    });
    return { ...newEvent, comments: [] };
};

export const deleteEvent = async (id: string): Promise<void> => {
    await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
        method: 'DELETE', headers
    });
};

export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ status })
    });
};

export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
        method: 'POST', headers,
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
