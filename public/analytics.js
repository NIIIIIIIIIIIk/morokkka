// Analytics.js — локальный режим (без внешнего API)
(function() {
    // Не отслеживаем админ-панель
    if (window.location.pathname.includes('admin') || window.location.pathname.includes('p4n3l')) return;
    
    // Сохраняем визит локально
    var key = 'call_sheet_analytics';
    var data = localStorage.getItem(key);
    var analytics = data ? JSON.parse(data) : {
        visits: [],
        totalVisits: 0,
        devices: {},
        browsers: {},
        os: {},
        dailyStats: {}
    };
    
    var visit = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        device: /Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : /Mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: /Firefox/i.test(navigator.userAgent) ? 'Firefox' : /Edg/i.test(navigator.userAgent) ? 'Edge' : /Chrome/i.test(navigator.userAgent) ? 'Chrome' : /Safari/i.test(navigator.userAgent) ? 'Safari' : 'Other',
        os: /Windows/i.test(navigator.userAgent) ? 'Windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : /Linux/i.test(navigator.userAgent) ? 'Linux' : /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/i.test(navigator.userAgent) ? 'iOS' : 'Other',
        screen: screen.width + 'x' + screen.height,
        lang: navigator.language
    };
    
    analytics.visits.push(visit);
    analytics.totalVisits++;
    analytics.devices[visit.device] = (analytics.devices[visit.device] || 0) + 1;
    analytics.browsers[visit.browser] = (analytics.browsers[visit.browser] || 0) + 1;
    analytics.os[visit.os] = (analytics.os[visit.os] || 0) + 1;
    
    var today = new Date().toISOString().split('T')[0];
    analytics.dailyStats[today] = (analytics.dailyStats[today] || 0) + 1;
    
    localStorage.setItem(key, JSON.stringify(analytics));
})();
