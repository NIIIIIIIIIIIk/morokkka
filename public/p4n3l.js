// ============ ЗАЩИТА ============
var SECRET_KEY = 'HuItA';
var params = new URLSearchParams(window.location.search);
if (params.get('key') !== SECRET_KEY && window.location.hostname !== 'localhost' && window.location.hostname !== '172.28.240.1') {
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:#888;font-family:monospace"><div style="text-align:center"><h1 style="font-size:72px;color:#e50914">404</h1><p>File not found</p></div></div>';
    throw new Error('Access denied');
}

// ============ КОНФИГ ============
var GIST_ID = 'ea1ea28fa7b5d1e3632392946af2f7bb';
var GIST_FILE = 'call-sheet-analytics.json';
var SYNC_TIME = 15000;
var KEYS = {
    STATE: 'call_sheet_state',
    ANALYTICS: 'call_sheet_analytics',
    TOKEN: 'gh_token'
};

// ============ ТОКЕН ============
function getToken() {
    var t = localStorage.getItem(KEYS.TOKEN);
    if (!t) {
        t = prompt('Введите GitHub токен (Cancel = только чтение):');
        if (t) localStorage.setItem(KEYS.TOKEN, t);
    }
    return t || '';
}

function clearToken() {
    localStorage.removeItem(KEYS.TOKEN);
    alert('Токен удалён');
    location.reload();
}

// ============ ДАННЫЕ ============
function getAnalytics() {
    var d = localStorage.getItem(KEYS.ANALYTICS);
    if (!d) {
        d = {visits:[],totalVisits:0,unlockCount:0,eventsCreated:0,commentsCount:0,devices:{},browsers:{},os:{},dailyStats:{},lastSync:null};
        localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(d));
        return d;
    }
    return JSON.parse(d);
}

function saveAnalytics(d) { localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(d)); }

// ============ GIST ============
function syncFromCloud() {
    return fetch('https://api.github.com/gists/' + GIST_ID, {
        headers: (function() { var h = {Accept: 'application/vnd.github.v3+json'}; var t = getToken(); if (t) h.Authorization = 'token ' + t; return h; })()
    })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(g) {
        if (g && g.files && g.files[GIST_FILE] && g.files[GIST_FILE].content) {
            return JSON.parse(g.files[GIST_FILE].content);
        }
        return null;
    })
    .catch(function(e) { console.warn('Load error:', e.message); return null; });
}

function syncToCloud() {
    var t = getToken();
    if (!t) return Promise.resolve(false);
    var d = getAnalytics();
    d.lastSync = new Date().toISOString();
    return fetch('https://api.github.com/gists/' + GIST_ID, {
        method: 'PATCH',
        headers: {Authorization: 'token ' + t, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json'},
        body: JSON.stringify({files: (function() { var f = {}; f[GIST_FILE] = {content: JSON.stringify(d, null, 2)}; return f; })()})
    })
    .then(function(r) { return r.ok; })
    .catch(function(e) { console.warn('Save error:', e.message); return false; });
}

function mergeData(local, cloud) {
    if (!cloud) return local;
    var all = (cloud.visits || []).concat(local.visits || []);
    var seen = {};
    var unique = [];
    for (var i = 0; i < all.length; i++) {
        var key = all[i].timestamp + '_' + all[i].ip;
        if (!seen[key]) { seen[key] = true; unique.push(all[i]); }
    }
    unique.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    
    var m = {
        visits: unique,
        totalVisits: unique.length,
        unlockCount: (cloud.unlockCount || 0) + (local.unlockCount || 0),
        eventsCreated: (cloud.eventsCreated || 0) + (local.eventsCreated || 0),
        commentsCount: (cloud.commentsCount || 0) + (local.commentsCount || 0),
        devices: Object.assign({}, cloud.devices),
        browsers: Object.assign({}, cloud.browsers),
        os: Object.assign({}, cloud.os),
        dailyStats: Object.assign({}, cloud.dailyStats),
        lastSync: new Date().toISOString()
    };
    
    ['devices', 'browsers', 'os', 'dailyStats'].forEach(function(k) {
        var loc = local[k] || {};
        for (var key in loc) { m[k][key] = (m[k][key] || 0) + loc[key]; }
    });
    
    return m;
}

function doSync() {
    syncFromCloud().then(function(cloud) {
        var local = getAnalytics();
        if (cloud) { saveAnalytics(mergeData(local, cloud)); }
        return syncToCloud();
    }).then(function() { refreshAll(); });
}

function syncNow() { doSync(); showStatus('🔄 Синхронизация...', 'success'); }

// ============ ОТОБРАЖЕНИЕ ============
function goToSite() { window.location.href = '/'; }

function refreshAll() {
    var d = getAnalytics();
    document.getElementById('totalVisits').textContent = d.totalVisits;
    document.getElementById('unlockCount').textContent = d.unlockCount;
    document.getElementById('eventsCreated').textContent = d.eventsCreated;
    document.getElementById('commentsCount').textContent = d.commentsCount;
    showDevices(d);
    showChart(d);
    showTable(d);
    showSyncInfo(d);
}

function showSyncInfo(d) {
    var el = document.getElementById('syncInfo');
    if (!el) {
        el = document.createElement('div');
        el.id = 'syncInfo';
        el.style.cssText = 'background:#1a1a1a;border:1px solid #e6b450;padding:10px 14px;margin-bottom:16px;font-size:11px;color:#e6b450;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px';
        var container = document.querySelector('.container');
        container.insertBefore(el, document.querySelector('.stats-grid'));
    }
    el.innerHTML = '<span>☁️ Gist синхронизация активна</span><span>' + (d.lastSync ? '🟢 ' + new Date(d.lastSync).toLocaleString('ru-RU') : '🟡 Ожидание...') + '</span>';
}

function showDevices(d) {
    var t = d.totalVisits || 1;
    showList('deviceStats', d.devices || {}, t);
    showList('browserStats', d.browsers || {}, t);
    showList('osStats', d.os || {}, t);
}

function showList(id, data, total) {
    var el = document.getElementById(id);
    var items = [];
    for (var k in data) { items.push({name: k, count: data[k]}); }
    items.sort(function(a, b) { return b.count - a.count; });
    if (!items.length) { el.innerHTML = '<div class="stat-item"><span class="stat-name">Нет данных</span></div>'; return; }
    el.innerHTML = items.map(function(i) {
        return '<div class="stat-item"><span class="stat-name">' + i.name + '</span><div class="stat-bar"><div class="stat-bar-fill" style="width:' + (i.count / total * 100) + '%"></div></div><span class="stat-count">' + i.count + '</span></div>';
    }).join('');
}

var chart = null;

function showChart(d) {
    var stats = d.dailyStats || {};
    var dates = Object.keys(stats).sort();
    var values = dates.map(function(k) { return stats[k]; });
    var ctx = document.getElementById('visitsChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.length ? dates : ['Нет данных'],
            datasets: [{label: 'Визиты', data: values.length ? values : [0], borderColor: '#e50914', backgroundColor: 'rgba(229,9,20,0.1)', tension: 0.1, fill: true}]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {legend: {labels: {color: '#fff'}}},
            scales: {
                y: {beginAtZero: true, grid: {color: '#333'}, ticks: {color: '#888', stepSize: 1}},
                x: {grid: {color: '#333'}, ticks: {color: '#888'}}
            }
        }
    });
}

function showTable(d) {
    var visits = (d.visits || []).slice().reverse().slice(0, 100);
    var tbody = document.getElementById('visitsTableBody');
    if (!visits.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">Нет данных</td></tr>'; return; }
    var actions = {visit:'🌐 Заход', unlock:'🔓 Разблокировка', create_event:'📅 Событие', add_comment:'💬 Комментарий', admin_visit:'🔧 Админ'};
    tbody.innerHTML = visits.map(function(v) {
        return '<tr><td>' + new Date(v.timestamp).toLocaleString('ru-RU') + '</td><td>' + v.ip + '</td><td>' + v.device + '</td><td>' + v.browser + '</td><td>' + v.os + '</td><td>' + (actions[v.action] || v.action) + '</td></tr>';
    }).join('');
}

// ============ ДЕЙСТВИЯ ============
function showStatus(msg, type) {
    var s = document.getElementById('status');
    s.textContent = msg;
    s.className = 'status ' + type;
}

function resetApp() {
    if (confirm('⚠️ Сбросить данные приложения?')) {
        localStorage.removeItem(KEYS.STATE);
        localStorage.removeItem('has_seen_onboarding');
        localStorage.removeItem('shown_easter_eggs');
        showStatus('✅ Данные сброшены', 'success');
        setTimeout(function() { location.reload(); }, 1500);
    }
}

function resetAnalytics() {
    if (confirm('⚠️ Сбросить аналитику?')) {
        localStorage.removeItem(KEYS.ANALYTICS);
        showStatus('✅ Аналитика сброшена', 'success');
        setTimeout(function() { location.reload(); }, 1500);
    }
}

function clearAll() {
    if (confirm('⚠️⚠️ Удалить ВСЁ?')) {
        localStorage.clear();
        showStatus('✅ Всё очищено', 'success');
        setTimeout(function() { location.reload(); }, 1500);
    }
}

function toggleDataView() {
    var v = document.getElementById('dataView');
    if (v.style.display === 'none') {
        var all = {};
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            try { all[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { all[k] = localStorage.getItem(k); }
        }
        v.textContent = JSON.stringify(all, null, 2);
        v.style.display = 'block';
    } else {
        v.style.display = 'none';
    }
}

function exportData() {
    var all = {};
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        try { all[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { all[k] = localStorage.getItem(k); }
    }
    var blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    showStatus('✅ Экспортировано', 'success');
}

function importData() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        var reader = new FileReader();
        reader.onload = function(ev) {
            try {
                var data = JSON.parse(ev.target.result);
                var current = getAnalytics();
                var cloudData = data[KEYS.ANALYTICS] || data;
                saveAnalytics(mergeData(current, cloudData));
                refreshAll();
                showStatus('✅ Импортировано', 'success');
            } catch(err) {
                showStatus('❌ Ошибка импорта', 'error');
            }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

// ============ СТАРТ ============
window.onload = function() {
    doSync();
    setInterval(doSync, SYNC_TIME);
};
