document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("scheduleForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const recipientIdsInput = document.getElementById('recipientIds');
            const recipientIds = recipientIdsInput.value.split(',').map(id => id.trim()).filter(id => id !== '');

            // Validate recipientIds
            if (recipientIds.length === 0) {
                showSubmitError("Recipients cannot be empty");
                return false;
            }

            const formData = new FormData(form);

            const jsonData = {
                recipientIds: recipientIds.map(id => parseInt(id)),
                objectId: formData.get("objectId") || null,
                message: formData.get("message") || "",
                deadline: formData.get("deadline") || null,
                type: formData.get("type") || null,
                delayHours: parseInt(formData.get("delayHours")) || 0
            };

            fetch("/api/v1/notifications/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(jsonData),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        showSubmitSuccess(data.message);
                        form.reset();
                    } else {
                        showSubmitError(data.error || "An error occurred");
                    }
                })
                .catch(err => {
                    console.error("AJAX Error:", err);
                    showSubmitError("Failed to connect to server");
                });
        });
    }

    function showSubmitSuccess(message) {
        const alertElement = createAlert("success", message);
        insertAlert(alertElement);
    }

    function showSubmitError(message) {
        const alertElement = createAlert("danger", message);
        insertAlert(alertElement);
    }

    function createAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} d-flex align-items-center alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');

        const icon = type === 'danger' ? 'exclamation-triangle' : 'check-circle';
        alertDiv.innerHTML = `
            <i class="bi bi-${icon} me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        return alertDiv;
    }

    function insertAlert(alertElement) {
        document.querySelectorAll('.alert').forEach(el => el.remove());

        const formContainer = form.closest('.container') || form.parentNode;
        formContainer.insertBefore(alertElement, form);

        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }
});
