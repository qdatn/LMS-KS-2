// 5 minutes countdown
let countdownTime = 5 * 60; // 5 minutes in seconds
const countdownElement = document.getElementById('countdown');

function updateCountdown() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;

    countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = '00:00';
        alert('OTP code has expired. Please request a new code.');
    } else {
        countdownTime--;
    }
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);