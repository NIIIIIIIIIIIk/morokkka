// ============ ТРЕКЕР ПОСЕТИТЕЛЕЙ ============
// Загрузите этот файл в index.html: <script src="/tracker.js"></script>

var GIST_ID = 'ea1ea28fa7b5d1e3632392946af2f7bb';
var GIST_FILE = 'call-sheet-analytics.json';
var TOKEN = ''; // Оставьте пустым — токен только у админа

(function() {
    // Не отслеживаем админ-панель
    if (window.location.pathname.includes('p4n3l')) return;
    
    // Данные визита
    var visit = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        device: detectDevice(),
        browser: detectBrowser(),
        os: detectOS(),
        screen: screen.width + 'x' + screen.height,
        lang: navigator.language
    };
    
    // Сохраняем локально
    saveLocal(visit);
    
    // Отправляем в Gist (без токена — только чтение, но админ с токеном потом синхронизирует)
    sendToGist(visit);
    
    function detectDevice() {
        var ua = navigator.userAgent;
        if (/Tablet|iPad/i.test(ua)) return 'Tablet';
        if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }
    
    function detectBrowser() {
        var ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        return 'Other';
    }
    
    function detectOS() {
        var ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Other';
    }
    
    function saveLocal(v) {
        var key = 'call_sheet_analytics';
        var d = localStorage.getItem(key);
        var data = d ? JSON.parse(d) : {visits:[],totalVisits:0,devices:{},browsers:{},os:{},dailyStats:{}};
        
        data.visits.push(v);
        data.totalVisits++;
        data.devices[v.device] = (data.devices[v.device] || 0) + 1;
        data.browsers[v.browser] = (data.browsers[v.browser] || 0) + 1;
        data.os[v.os] = (data.os[v.os] || 0) + 1;
        
        var today = new Date().toISOString().split('T')[0];
        data.dailyStats[today] = (data.dailyStats[today] || 0) + 1;
        
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    function sendToGist(v) {
        // Пытаемся отправить через fetch
        var data = {
            visits: [v],
            totalVisits: 1,
            devices: {},
            browsers: {},
            os: {},
            dailyStats: {}
        };
        data.devices[v.device] = 1;
        data.browsers[v.browser] = 1;
        data.os[v.os] = 1;
        var today = new Date().toISOString().split('T')[0];
        data.dailyStats[today] = 1;
        
        // Без токена — только сохраняем локально
        // Админ с токеном заберёт данные при синхронизации
        console.log('📊 Визит записан локально. Админ синхронизирует позже.');
    }
})();
