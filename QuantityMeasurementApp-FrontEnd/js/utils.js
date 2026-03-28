// Utility functions

function showAlert(elementId, message, type = 'error') {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.className = `alert alert-${type}`;
        alertElement.innerHTML = `
            <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : '⚠️'}</span>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.classList.add('hidden')">✕</button>
        `;
        alertElement.classList.remove('hidden');
    }
}

function hideAlert(elementId) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.classList.add('hidden');
    }
}

function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        const btnText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');
        if (btnText) btnText.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');
        button.disabled = true;
    }
}

function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        const btnText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');
        if (btnText) btnText.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
        button.disabled = false;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    const re = /^[a-zA-Z0-9_]+$/;
    return username.length >= 3 && re.test(username);
}

function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 34;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 33;
    if (/[0-9]/.test(password)) score += 33;
    return score;
}

function getStrengthColor(strength) {
    if (strength <= 34) return '#ef4444';
    if (strength <= 67) return '#eab308';
    return '#22c55e';
}