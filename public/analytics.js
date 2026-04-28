var API_URL = 'https://api.nikitv86.beget.tech';
(function() {
    if (window.location.pathname.includes('admin') || window.location.pathname.includes('p4n3l')) return;
    var p = 'page=' + encodeURIComponent(window.location.pathname) +
        '&device=' + (/Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : /Mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop') +
        '&browser=' + (/Firefox/i.test(navigator.userAgent) ? 'Firefox' : /Edg/i.test(navigator.userAgent) ? 'Edge' : /Chrome/i.test(navigator.userAgent) ? 'Chrome' : /Safari/i.test(navigator.userAgent) ? 'Safari' : 'Other') +
        '&os=' + (/Windows/i.test(navigator.userAgent) ? 'Windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : /Linux/i.test(navigator.userAgent) ? 'Linux' : /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/i.test(navigator.userAgent) ? 'iOS' : 'Other') +
        '&screen=' + screen.width + 'x' + screen.height + '&lang=' + navigator.language;
    new Image().src = API_URL + '/visit?' + p;
})();
