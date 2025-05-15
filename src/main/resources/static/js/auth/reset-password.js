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

// Check password strength
const passwordInput = document.getElementById('newPassword');
const passwordStrength = document.getElementById('passwordStrength');
const passwordFeedback = document.getElementById('passwordFeedback');

passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) {
        strength += 25;
        feedback.push('Valid length');
    } else {
        feedback.push('Password must be at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
        strength += 25;
        feedback.push('Has uppercase');
    } else {
        feedback.push('Needs at least 1 uppercase letter');
    }

    if (/[0-9]/.test(password)) {
        strength += 25;
        feedback.push('Has number');
    } else {
        feedback.push('Needs at least 1 number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        strength += 25;
        feedback.push('Has special character');
    } else {
        feedback.push('Needs at least 1 special character');
    }

    passwordStrength.style.width = strength + '%';

    if (strength <= 25) {
        passwordStrength.className = 'progress-bar bg-danger';
        passwordFeedback.style.color = '#dc3545';
    } else if (strength <= 50) {
        passwordStrength.className = 'progress-bar bg-warning';
        passwordFeedback.style.color = '#ffc107';
    } else if (strength <= 75) {
        passwordStrength.className = 'progress-bar bg-info';
        passwordFeedback.style.color = '#0dcaf0';
    } else {
        passwordStrength.className = 'progress-bar bg-success';
        passwordFeedback.style.color = '#198754';
    }

    passwordFeedback.textContent = feedback[0];
});

// Check password confirmation match
const confirmInput = document.getElementById('confirmPassword');
const passwordMatch = document.getElementById('passwordMatch');
const submitBtn = document.getElementById('submitBtn');

function checkPasswordMatch() {
    if (passwordInput.value !== confirmInput.value) {
        confirmInput.classList.add('is-invalid');
        passwordMatch.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        confirmInput.classList.remove('is-invalid');
        passwordMatch.style.display = 'none';
        submitBtn.disabled = false;
    }
}

confirmInput.addEventListener('input', checkPasswordMatch);
passwordInput.addEventListener('input', function() {
    if (confirmInput.value) {
        checkPasswordMatch();
    }
});

// Form validation
document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    if (passwordInput.value !== confirmInput.value) {
        event.preventDefault();
        confirmInput.classList.add('is-invalid');
        passwordMatch.style.display = 'block';
    }
});