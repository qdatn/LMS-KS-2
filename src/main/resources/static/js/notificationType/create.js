document.addEventListener("DOMContentLoaded", function () {
    const notificationForm = document.getElementById("notificationTypeForm");
    const nameInput = document.getElementById("notificationTypeName");
    const titleInput = document.getElementById("notificationTypeTitle");
    const objectTypeSelect = document.getElementById("notificationObjectType");
    const iconInput = document.getElementById("icon");

    // Form submission handler
    notificationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare notification type data for API
        const notificationType = {
            name: nameInput.value.trim(),
            title: titleInput.value.trim(),
            objectType: objectTypeSelect.value,
            icon: iconInput.value.trim()
        };

        const notificationObjectType = objectTypeSelect.value;

        // Send notification type data via AJAX
        fetch(`/api/v1/notification-types?notificationObjectType=${encodeURIComponent(notificationObjectType)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationType)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.text();
            })
            .then(data => {
                showNotification('success', 'Notification type added successfully!');

                // Reset form after successful submission
                setTimeout(() => {
                    notificationForm.reset();
                }, 1500);
            })
            .catch(error => {
                showNotification('error', error.message || 'Failed to add notification type');
            });
    });

    // Validate form before submission
    function validateForm() {
        let isValid = true;
        let errorMessage = "";

        if (!nameInput.value.trim()) {
            errorMessage = "Notification Type Name is required.";
            isValid = false;
        } else if (!titleInput.value.trim()) {
            errorMessage = "Notification Type Title is required.";
            isValid = false;
        } else if (!objectTypeSelect.value) {
            errorMessage = "Object Type must be selected.";
            isValid = false;
        } else if (!iconInput.value.trim()) {
            errorMessage = "Icon is required.";
            isValid = false;
        }

        if (!isValid) {
            showNotification('error', errorMessage);
        }

        return isValid;
    }

    // Display notification message to user
    function showNotification(type, message) {
        // Check if error alert already exists and remove it
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} d-flex align-items-center`;
        alertDiv.setAttribute('role', 'alert');

        const icon = type === 'error' ? 'exclamation-triangle' : 'check-circle';
        alertDiv.innerHTML = `<i class="bi bi-${icon} me-2"></i><span>${message}</span>`;

        // Insert alert before the form
        notificationForm.parentNode.insertBefore(alertDiv, notificationForm);

        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
});
