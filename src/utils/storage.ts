import { Event, Comment, AppState } from '../types';

// API для работы с базой данных
const API_URL = 'https://call-api.nikiitsky.workers.dev';

// ============ ЗАГРУЗКА СОСТОЯНИЯ ============
export const loadState = async (): Promise<AppState> => {
    try {
        const response = await fetch(`${API_URL}?action=events`);
        const events = await response.json();
        
        // Загружаем комментарии для каждого события
        const eventsWithComments = await Promise.all(
            events.map(async (event: Event) => {
                const comments = await loadComments(event.id);
                return { ...event, comments };
            })
        );
        
        return {
            isUnlocked: localStorage.getItem('call_sheet_unlocked') === 'true',
            events: eventsWithComments
        };
    } catch (error) {
        console.error('Failed to load state:', error);
        // Fallback к localStorage если API недоступен
        return loadStateLocal();
    }
};

// ============ СОХРАНЕНИЕ СОСТОЯНИЯ ============
export const saveState = async (state: AppState): Promise<void> => {
    // Сохраняем только флаг разблокировки локально
    localStorage.setItem('call_sheet_unlocked', String(state.isUnlocked));
    // События сохраняются через отдельные функции
};

// ============ РАЗБЛОКИРОВКА ============
export const unlockApp = (): void => {
    localStorage.setItem('call_sheet_unlocked', 'true');
};

// ============ ДОБАВЛЕНИЕ СОБЫТИЯ ============
export const addEvent = async (event: Omit<Event, 'id' | 'comments'>): Promise<Event> => {
    const newEvent: Event = {
        ...event,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        comments: []
    };
    
    try {
        await fetch(`${API_URL}?action=add_event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        });
    } catch (error) {
        console.error('Failed to add event:', error);
        // Fallback к localStorage
        addEventLocal(newEvent);
    }
    
    return newEvent;
};

// ============ УДАЛЕНИЕ СОБЫТИЯ ============
export const deleteEvent = async (id: string): Promise<void> => {
    try {
        await fetch(`${API_URL}?action=delete_event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (error) {
        console.error('Failed to delete event:', error);
        deleteEventLocal(id);
    }
};

// ============ ОБНОВЛЕНИЕ СТАТУСА ============
export const updateEventStatus = async (id: string, status: Event['status']): Promise<void> => {
    try {
        await fetch(`${API_URL}?action=update_event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, notes: '' })
        });
    } catch (error) {
        console.error('Failed to update event:', error);
        updateEventLocal(id, status);
    }
};

// ============ ДОБАВЛЕНИЕ КОММЕНТАРИЯ ============
export const addComment = async (eventId: string, author: 'NIK' | 'ELINA', text: string): Promise<void> => {
    const commentId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    try {
        await fetch(`${API_URL}?action=add_comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: commentId,
                event_id: eventId,
                author,
                text
            })
        });
    } catch (error) {
        console.error('Failed to add comment:', error);
        addCommentLocal(eventId, { id: commentId, author, text, timestamp: Date.now() });
    }
};

// ============ ЗАГРУЗКА КОММЕНТАРИЕВ ============
const loadComments = async (eventId: string): Promise<Comment[]> => {
    try {
        const response = await fetch(`${API_URL}?action=comments&event_id=${eventId}`);
        const comments = await response.json();
        return comments.map((c: any) => ({
            id: c.id,
            author: c.author as 'NICK' | 'ELINA',
            text: c.text,
            timestamp: new Date(c.created_at).getTime()
        }));
    } catch (error) {
        console.error('Failed to load comments:', error);
        return [];
    }
};

// ============ ЛОКАЛЬНЫЙ FALLBACK ============
const STORAGE_KEY = 'call_sheet_state';

const loadStateLocal = (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // corrupted data
        }
    }
    return {
        isUnlocked: false,
        events: []
    };
};

const saveStateLocal = (state: AppState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const addEventLocal = (event: Event): void => {
    const state = loadStateLocal();
    state.events.push(event);
    saveStateLocal(state);
};

const deleteEventLocal = (id: string): void => {
    const state = loadStateLocal();
    state.events = state.events.filter(e => e.id !== id);
    saveStateLocal(state);
};

const updateEventLocal = (id: string, status: Event['status']): void => {
    const state = loadStateLocal();
    const event = state.events.find(e => e.id === id);
    if (event) {
        event.status = status;
        saveStateLocal(state);
    }
};

const addCommentLocal = (eventId: string, comment: Comment): void => {
    const state = loadStateLocal();
    const event = state.events.find(e => e.id === eventId);
    if (event) {
        event.comments.push(comment);
        saveStateLocal(state);
    }
};
