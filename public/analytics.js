// ============ АВТОМАТИЧЕСКАЯ АНАЛИТИКА FIREBASE ============
// Замените URL на ваш из Firebase
var FIREBASE_URL = 'https://console.firebase.google.com/u/0/project/call-sheet-analytics/database/call-sheet-analytics-default-rtdb/data/~2F';

(function() {
    // Не отслеживаем админку
    if (window.location.pathname.includes('p4n3l')) return;
    
    // Собираем данные
    var visit = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        device: getDevice(),
        browser: getBrowser(),
        os: getOS(),
        screen: screen.width + 'x' + screen.height,
        lang: navigator.language,
        userAgent: navigator.userAgent.substring(0, 100)
    };
    
    // Отправляем в Firebase
    sendToFirebase(visit);
    
    function getDevice() {
        var ua = navigator.userAgent;
        if (/Tablet|iPad/i.test(ua)) return 'Tablet';
        if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }
    
    function getBrowser() {
        var ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Opera')) return 'Opera';
        return 'Other';
    }
    
    function getOS() {
        var ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Other';
    }
    
    function sendToFirebase(data) {
        fetch(FIREBASE_URL + '/visits.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(function() {
            console.log('📊 Визит записан');
        }).catch(function(err) {
            console.log('Ошибка:', err);
        });
    }
})();
