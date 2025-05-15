function handleSubmit(e) {
    e.preventDefault();
    const button = document.getElementById('submitBtn');
    button.disabled = true;

    // Submit the form
    button.closest('form').submit();

    setTimeout(() => {
        button.disabled = false;
    }, 10000);
}
document.addEventListener('DOMContentLoaded', function() {
    // Thêm các xử lý JS khác nếu cần
});
