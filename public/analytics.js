var API_URL = '//nikitv86.beget.tech/api.php';

(function() {
    if (window.location.pathname.includes('admin')) return;
    var params = 'action=visit&page=' + encodeURIComponent(window.location.pathname) +
        '&device=' + (/Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : /Mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop') +
        '&browser=' + (/Firefox/i.test(navigator.userAgent) ? 'Firefox' : /Edg/i.test(navigator.userAgent) ? 'Edge' : /Chrome/i.test(navigator.userAgent) ? 'Chrome' : /Safari/i.test(navigator.userAgent) ? 'Safari' : 'Other') +
        '&os=' + (/Windows/i.test(navigator.userAgent) ? 'Windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : /Linux/i.test(navigator.userAgent) ? 'Linux' : /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/i.test(navigator.userAgent) ? 'iOS' : 'Other') +
        '&screen=' + screen.width + 'x' + screen.height + '&lang=' + navigator.language;
    new Image().src = 'http://nikitv86.beget.tech/api.php?' + params;
})();
