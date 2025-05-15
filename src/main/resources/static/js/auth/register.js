// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(inputId + 'Toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Password strength check
const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('passwordStrengthBar');
const passwordFeedback = document.getElementById('passwordFeedback');

passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    let feedbacks = [];

    // Check password length
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedbacks.push('Password must be at least 8 characters');
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        feedbacks.push('Add at least 1 uppercase letter');
    }

    // Check for numbers
    if (/[0-9]/.test(password)) {
        strength += 25;
    } else {
        feedbacks.push('Add at least 1 number');
    }

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) {
        strength += 25;
    } else {
        feedbacks.push('Add at least 1 special character');
    }

    // Update strength bar
    strengthBar.style.width = strength + '%';

    // Update strength bar color using Bootstrap classes
    strengthBar.className = 'progress-bar';
    if (strength <= 25) {
        strengthBar.classList.add('bg-danger');
        passwordFeedback.className = 'form-text text-danger';
    } else if (strength <= 50) {
        strengthBar.classList.add('bg-warning');
        passwordFeedback.className = 'form-text text-warning';
    } else if (strength <= 75) {
        strengthBar.classList.add('bg-info');
        passwordFeedback.className = 'form-text text-info';
    } else {
        strengthBar.classList.add('bg-success');
        passwordFeedback.className = 'form-text text-success';
    }

    // Update feedback text
    if (feedbacks.length > 0) {
        passwordFeedback.textContent = feedbacks[0];
    } else {
        passwordFeedback.textContent = 'Strong password!';
    }
});

// Confirm password validation
const confirmInput = document.getElementById('confirmPassword');
const passwordMatchFeedback = document.getElementById('passwordMatchFeedback');

function checkPasswordMatch() {
    if (passwordInput.value === confirmInput.value) {
        confirmInput.classList.remove('is-invalid');
        passwordMatchFeedback.style.display = 'none';
        return true;
    } else {
        confirmInput.classList.add('is-invalid');
        passwordMatchFeedback.style.display = 'block';
        return false;
    }
}

confirmInput.addEventListener('input', checkPasswordMatch);
passwordInput.addEventListener('input', function() {
    if (confirmInput.value) {
        checkPasswordMatch();
    }
});

(function() {
    'use strict';

    const form = document.getElementById('registerForm');

    form.addEventListener('submit', function(event) {
        if (!form.checkValidity() || !checkPasswordMatch()) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');
    }, false);
})();