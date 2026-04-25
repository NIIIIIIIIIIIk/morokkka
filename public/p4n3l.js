// ============ ЗАЩИТА ДОСТУПА ============
const SECRET_KEY = 'HuItA';

(function checkAccess() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '178.71.193.234') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('key') !== SECRET_KEY) {
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#888;font-family:monospace;flex-direction:column"><h1 style="font-size:72px;margin:0;color:#e50914">404</h1><p style="font-size:16px;margin-top:10px">File not found</p></div>';
        throw new Error('Access denied');
    }
})();

// ============ КОНФИГУРАЦИЯ ============
const GIST_ID = 'ea1ea28fa7b5d1e3632392946af2f7bb';
const GIST_FILENAME = 'call-sheet-analytics.json';
const SYNC_INTERVAL = 15000;
const STORAGE_KEYS = {
    APP_STATE: 'call_sheet_state',
    ANALYTICS: 'call_sheet_analytics',
    ONBOARDING: 'has_seen_onboarding',
    EASTER_EGGS: 'shown_easter_eggs',
    GIST_ID: 'gist_id',
    TOKEN: 'gh_sync_token'
};

// ============ ПОЛУЧЕНИЕ ТОКЕНА ============
function getToken() {
    let token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
        token = prompt('Введите GitHub токен для синхронизации\n(или нажмите Cancel для режима чтения):');
        if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    return token || '';
}

function clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    alert('Токен удалён. При следующей синхронизации будет запрошен новый.');
}

// ============ ДАННЫЕ ============
function initAnalytics() {
    if (!localStorage.getItem(STORAGE_KEYS.ANALYTICS)) {
        const analytics = {
            visits: [],
            totalVisits: 0,
            unlockCount: 0,
            eventsCreated: 0,
            commentsCount: 0,
            devices: {},
            browsers: {},
            os: {},
            dailyStats: {},
            lastSync: null
        };
        localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    }
}

function getAnalytics() {
    initAnalytics();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYTICS));
}

function saveAnalytics(analytics) {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
}

// ============ СИНХРОНИЗАЦИЯ ЧЕРЕЗ GIST ============
async function syncFromCloud() {
    if (!GIST_ID) return null;
    
    try {
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        const token = getToken();
        if (token) headers['Authorization'] = `token ${token}`;
        
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
        
        if (response.ok) {
            const gist = await response.json();
            const file = gist.files[GIST_FILENAME];
            if (file && file.content) {
                return JSON.parse(file.content);
            }
        }
    } catch (error) {
        console.warn('⚠️ Ошибка загрузки из Gist:', error.message);
    }
    return null;
}

async function syncToCloud() {
    const analytics = getAnalytics();
    analytics.lastSync = new Date().toISOString();
    
    const token = getToken();
    if (!token) {
        console.log('ℹ️ Токен не указан, сохранение недоступно');
        return false;
    }
    
    try {
        const content = JSON.stringify(analytics, null, 2);
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({ files: { [GIST_FILENAME]: { content } } })
        });
        
        if (response.ok) {
            console.log('✅ Данные сохранены в Gist');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Ошибка сохранения:', error.message);
    }
    return false;
}

function mergeAnalytics(localData, cloudData) {
    if (!cloudData) return localData;
    
    const allVisits = [...(cloudData.visits || []), ...(localData.visits || [])];
    const uniqueVisits = [];
    const seen = new Set();
    
    for (const visit of allVisits) {
        const key = `${visit.timestamp}_${visit.ip}`;
        if (!seen.has(key)) { seen.add(key); uniqueVisits.push(visit); }
    }
    uniqueVisits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const merged = {
        visits: uniqueVisits,
        totalVisits: uniqueVisits.length,
        unlockCount: (cloudData.unlockCount || 0) + (localData.unlockCount || 0),
        eventsCreated: (cloudData.eventsCreated || 0) + (localData.eventsCreated || 0),
        commentsCount: (cloudData.commentsCount || 0) + (localData.commentsCount || 0),
        devices: { ...cloudData.devices },
        browsers: { ...cloudData.browsers },
        os: { ...cloudData.os },
        dailyStats: { ...cloudData.dailyStats },
        lastSync: new Date().toISOString()
    };
    
    for (const key of Object.keys(localData.devices || {})) {
        merged.devices[key] = (merged.devices[key] || 0) + localData.devices[key];
    }
    for (const key of Object.keys(localData.browsers || {})) {
        merged.browsers[key] = (merged.browsers[key] || 0) + localData.browsers[key];
    }
    for (const key of Object.keys(localData.os || {})) {
        merged.os[key] = (merged.os[key] || 0) + localData.os[key];
    }
    for (const key of Object.keys(localData.dailyStats || {})) {
        merged.dailyStats[key] = (merged.dailyStats[key] || 0) + localData.dailyStats[key];
    }
    
    return merged;
}

async function performSync() {
    const cloudData = await syncFromCloud();
    const localData = getAnalytics();
    
    if (cloudData) {
        const merged = mergeAnalytics(localData, cloudData);
        saveAnalytics(merged);
    }
    
    await syncToCloud();
    refreshDisplay();
}

// ============ ОТОБРАЖЕНИЕ ============
function detectDevice() {
    const ua = navigator.userAgent;
    if (/Tablet|iPad/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'Mobile';
    return 'Desktop';
}

function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
}

function detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
}

async function getIP() {
    try {
        const r = await fetch('https://api.ipify.org?format=json');
        return (await r.json()).ip;
    } catch { return 'unknown'; }
}

async function trackVisit(action = 'visit') {
    const analytics = getAnalytics();
    const today = new Date().toISOString().split('T')[0];
    const visit = {
        timestamp: new Date().toISOString(),
        ip: await getIP(),
        device: detectDevice(),
        browser: detectBrowser(),
        os: detectOS(),
        action: action
    };
    
    analytics.visits.push(visit);
    analytics.totalVisits++;
    analytics.devices[visit.device] = (analytics.devices[visit.device] || 0) + 1;
    analytics.browsers[visit.browser] = (analytics.browsers[visit.browser] || 0) + 1;
    analytics.os[visit.os] = (analytics.os[visit.os] || 0) + 1;
    analytics.dailyStats[today] = (analytics.dailyStats[today] || 0) + 1;
    if (action === 'unlock') analytics.unlockCount++;
    if (action === 'create_event') analytics.eventsCreated++;
    if (action === 'add_comment') analytics.commentsCount++;
    
    saveAnalytics(analytics);
}

function refreshDisplay() {
    displayStats();
    displayDeviceStats();
    displayChart();
    displayVisitsTable();
    updateSyncStatus();
}

function updateSyncStatus() {
    const a = getAnalytics();
    const el = document.getElementById('syncStatus');
    if (el) el.innerHTML = a.lastSync ? `🟢 ${new Date(a.lastSync).toLocaleString('ru-RU')}` : '🟡 Ожидание...';
}

function displayDataSource() {
    const infoEl = document.createElement('div');
    infoEl.style.cssText = 'background:#1a1a1a;border:1px solid #e6b450;padding:10px 14px;margin-bottom:16px;font-size:11px;color:#e6b450;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px';
    infoEl.innerHTML = `<div>📱 ${detectDevice()} | 🌐 ${detectBrowser()} | 💻 ${detectOS()} | ☁️ Gist: ${GIST_ID ? 'активен' : 'не настроен'}</div><div id="syncStatus">🔄 Синхронизация...</div>`;
    const container = document.querySelector('.container');
    const existing = container.querySelector('.sync-info');
    if (existing) existing.remove();
    infoEl.className = 'sync-info';
    container.insertBefore(infoEl, document.querySelector('.stats-grid'));
}

function displayStats() {
    const a = getAnalytics();
    document.getElementById('totalVisits').textContent = a.totalVisits;
    document.getElementById('unlockCount').textContent = a.unlockCount;
    document.getElementById('eventsCreated').textContent = a.eventsCreated;
    document.getElementById('commentsCount').textContent = a.commentsCount;
}

function displayDeviceStats() {
    const a = getAnalytics();
    const t = a.totalVisits || 1;
    displayStatList('deviceStats', a.devices, t);
    displayStatList('browserStats', a.browsers, t);
    displayStatList('osStats', a.os, t);
}

function displayStatList(id, data, total) {
    const el = document.getElementById(id);
    const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
    if (!entries.length) { el.innerHTML = '<div class="stat-item"><span class="stat-name">Нет данных</span></div>'; return; }
    el.innerHTML = entries.map(([n, c]) => `<div class="stat-item"><span class="stat-name">${n}</span><div class="stat-bar"><div class="stat-bar-fill" style="width:${(c/total)*100}%"></div></div><span class="stat-count">${c}</span></div>`).join('');
}

let chartInstance = null;

function displayChart() {
    const a = getAnalytics();
    const dates = Object.keys(a.dailyStats || {}).sort();
    const values = dates.map(d => a.dailyStats[d]);
    const ctx = document.getElementById('visitsChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.length ? dates : ['Нет данных'],
            datasets: [{ label: 'Визиты', data: values.length ? values : [0], borderColor: '#e50914', backgroundColor: 'rgba(229,9,20,0.1)', tension: 0.1, fill: true, pointBackgroundColor: '#e50914', pointRadius: 3 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: { y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888', stepSize: 1 } }, x: { grid: { color: '#333' }, ticks: { color: '#888' } } }
        }
    });
}

function displayVisitsTable() {
    const visits = [...(getAnalytics().visits || [])].reverse().slice(0, 100);
    const tbody = document.getElementById('visitsTableBody');
    if (!visits.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">Нет данных</td></tr>'; return; }
    const actions = { visit: '🌐 Заход', unlock: '🔓 Разблокировка', create_event: '📅 Событие', add_comment: '💬 Комментарий', admin_visit: '🔧 Админ' };
    tbody.innerHTML = visits.map(v => `<tr><td>${new Date(v.timestamp).toLocaleString('ru-RU')}</td><td>${v.ip}</td><td>${v.device}</td><td>${v.browser}</td><td>${v.os}</td><td>${actions[v.action] || v.action}</td></tr>`).join('');
}

// ============ УПРАВЛЕНИЕ ============
function resetApp() {
    if (confirm('⚠️ Сбросить данные приложения?')) {
        localStorage.removeItem(STORAGE_KEYS.APP_STATE);
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
        localStorage.removeItem(STORAGE_KEYS.EASTER_EGGS);
        showStatus('✅ Данные сброшены', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function resetAnalytics() {
    if (confirm('⚠️ Сбросить аналитику?')) {
        localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
        showStatus('✅ Аналитика сброшена', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function clearLocalStorage() {
    if (confirm('⚠️⚠️ Очистить ВСЕ?')) {
        localStorage.clear();
        showStatus('✅ Всё очищено', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function showStatus(msg, type) {
    const s = document.getElementById('status');
    s.textContent = msg;
    s.className = `status ${type}`;
}

function toggleDataView() {
    const v = document.getElementById('dataView');
    if (v.style.display === 'none') {
        const all = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            try { all[k] = JSON.parse(localStorage.getItem(k)); } catch { all[k] = localStorage.getItem(k); }
        }
        v.textContent = JSON.stringify(all, null, 2);
        v.style.display = 'block';
    } else { v.style.display = 'none'; }
}

function exportData() {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        try { all[k] = JSON.parse(localStorage.getItem(k)); } catch { all[k] = localStorage.getItem(k); }
    }
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showStatus('✅ Экспортировано', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const current = getAnalytics();
                const cloudData = data[STORAGE_KEYS.ANALYTICS] || data;
                const merged = mergeAnalytics(current, cloudData);
                saveAnalytics(merged);
                refreshDisplay();
                showStatus('✅ Импортировано', 'success');
            } catch { showStatus('❌ Ошибка', 'error'); }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

function manualSyncToGist() {
    performSync();
    showStatus('🔄 Синхронизация...', 'success');
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
window.onload = async function() {
    initAnalytics();
    await performSync();
    await trackVisit('admin_visit');
    displayDataSource();
    refreshDisplay();
    setInterval(performSync, SYNC_INTERVAL);
};
