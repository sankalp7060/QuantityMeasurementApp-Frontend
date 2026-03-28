document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const strengthContainer = document.getElementById('strengthContainer');
    const strengthPercent = document.getElementById('strengthPercent');
    const strengthFill = document.getElementById('strengthFill');
    const matchMessage = document.getElementById('matchMessage');
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
    
    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            toggleConfirmPasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
    
    // Password strength meter
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = getPasswordStrength(password);
            
            if (strength > 0) {
                strengthContainer.classList.remove('hidden');
                strengthPercent.textContent = `${strength}%`;
                strengthFill.style.width = `${strength}%`;
                strengthFill.style.backgroundColor = getStrengthColor(strength);
            } else {
                strengthContainer.classList.add('hidden');
            }
        });
    }
    
    // Confirm password match
    const checkMatch = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword) {
            if (password === confirmPassword) {
                matchMessage.textContent = '✓ Passwords match';
                matchMessage.classList.remove('hidden');
            } else {
                matchMessage.textContent = '✗ Passwords do not match';
                matchMessage.classList.remove('hidden');
            }
        } else {
            matchMessage.classList.add('hidden');
        }
    };
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkMatch);
        passwordInput.addEventListener('input', checkMatch);
    }
    
    // Clear errors on input
    const fields = ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword'];
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.addEventListener('input', () => {
                const errorEl = document.getElementById(`${field}Error`);
                if (errorEl) errorEl.textContent = '';
                hideAlert('errorAlert');
            });
        }
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validation
        let hasError = false;
        
        if (!firstName) {
            document.getElementById('firstNameError').textContent = 'First name is required';
            hasError = true;
        }
        
        if (!lastName) {
            document.getElementById('lastNameError').textContent = 'Last name is required';
            hasError = true;
        }
        
        if (!username) {
            document.getElementById('usernameError').textContent = 'Username is required';
            hasError = true;
        } else if (!validateUsername(username)) {
            document.getElementById('usernameError').textContent = 'Username must be at least 3 characters and contain only letters, numbers, underscores';
            hasError = true;
        }
        
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            hasError = true;
        } else if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'Invalid email format';
            hasError = true;
        }
        
        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            hasError = true;
        } else if (password.length < 8) {
            document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
            hasError = true;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            hasError = true;
        }
        
        if (hasError) return;
        
        // Show loading
        showLoading('registerBtn');
        
        try {
            const data = { firstName, lastName, username, email, password, confirmPassword };
            const response = await authService.register(data);
            
            if (response.success) {
                window.location.href = '/dashboard.html';
            } else {
                showAlert('errorAlert', response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('errorAlert', 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000');
        } finally {
            hideLoading('registerBtn');
        }
    });
});