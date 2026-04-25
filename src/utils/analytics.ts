const STORAGE_KEY = 'call_sheet_analytics';

interface Visit {
    timestamp: string;
    ip: string;
    device: string;
    browser: string;
    os: string;
    action: string;
}

interface Analytics {
    visits: Visit[];
    totalVisits: number;
    unlockCount: number;
    eventsCreated: number;
    commentsCount: number;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    os: Record<string, number>;
    dailyStats: Record<string, number>;
}

export function initAnalytics(): void {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const analytics: Analytics = {
            visits: [],
            totalVisits: 0,
            unlockCount: 0,
            eventsCreated: 0,
            commentsCount: 0,
            devices: {},
            browsers: {},
            os: {},
            dailyStats: {}
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
    }
}

function detectDevice(): string {
    const ua = navigator.userAgent;
    if (/Tablet|iPad/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'Mobile';
    return 'Desktop';
}

function detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera')) return 'Opera';
    return 'Other';
}

function detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
}

async function getIP(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}

export async function trackVisit(action: string = 'visit'): Promise<void> {
    initAnalytics();
    const analytics: Analytics = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const today = new Date().toISOString().split('T')[0];
    
    const ip = await getIP();
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();
    
    const visit: Visit = {
        timestamp: new Date().toISOString(),
        ip,
        device,
        browser,
        os,
        action
    };
    
    analytics.visits.push(visit);
    analytics.totalVisits++;
    analytics.devices[device] = (analytics.devices[device] || 0) + 1;
    analytics.browsers[browser] = (analytics.browsers[browser] || 0) + 1;
    analytics.os[os] = (analytics.os[os] || 0) + 1;
    analytics.dailyStats[today] = (analytics.dailyStats[today] || 0) + 1;
    
    if (action === 'unlock') analytics.unlockCount++;
    if (action === 'create_event') analytics.eventsCreated++;
    if (action === 'add_comment') analytics.commentsCount++;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
}