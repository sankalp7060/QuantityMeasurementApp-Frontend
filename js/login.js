document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameOrEmailInput = document.getElementById('usernameOrEmail');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    
    // Load saved username if exists
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
        usernameOrEmailInput.value = savedUsername;
        rememberMeCheckbox.checked = true;
    }
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
    
    // Clear errors on input
    const clearError = (fieldId, errorId) => {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(errorId);
        if (field) {
            field.addEventListener('input', () => {
                if (error) error.textContent = '';
                hideAlert('errorAlert');
            });
        }
    };
    
    clearError('usernameOrEmail', 'usernameError');
    clearError('password', 'passwordError');
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameOrEmail = usernameOrEmailInput.value.trim();
        const password = passwordInput.value;
        
        // Validation
        let hasError = false;
        
        if (!usernameOrEmail) {
            document.getElementById('usernameError').textContent = 'Username or email is required';
            hasError = true;
        }
        
        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            hasError = true;
        }
        
        if (hasError) return;
        
        // Show loading
        showLoading('loginBtn');
        
        try {
            const data = { usernameOrEmail, password };
            const response = await authService.login(data);
            
            if (response.success) {
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('savedUsername', usernameOrEmail);
                } else {
                    localStorage.removeItem('savedUsername');
                }
                window.location.href = '/dashboard.html';
            } else {
                showAlert('errorAlert', response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('errorAlert', 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
        } finally {
            hideLoading('loginBtn');
        }
    });
    
    // Google login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:5000/api/v1/Auth/google/login';
        });
    }
});