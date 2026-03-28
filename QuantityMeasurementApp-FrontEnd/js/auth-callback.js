// This script is embedded in auth-callback.html
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userParam = urlParams.get('user');

    if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        if (userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }
        
        window.location.href = '/dashboard.html';
    } else {
        window.location.href = '/login.html';
    }
})();