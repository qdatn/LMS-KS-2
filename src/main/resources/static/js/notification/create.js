document.addEventListener("DOMContentLoaded", function () {
    const notificationForm = document.getElementById("notificationForm");
    const typeSelect = document.getElementById("type");
    const messageInput = document.getElementById("message");
    const objectIdInput = document.getElementById("objectId");
    const selectedObjectIdInput = document.getElementById("selectedObjectId");
    const recipientIdsInput = document.getElementById("recipientIds");
    const clearRecipientsBtn = document.getElementById("clearRecipients");

    // Form submission handler
    notificationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare notification data for API
        const notificationData = {
            notification: {
                message: messageInput.value,
                type: { id: parseInt(typeSelect.value) },
                objectId: selectedObjectIdInput.value || null
            },
            recipientIds: recipientIdsInput.value ? recipientIdsInput.value.split(',').map(id => id.trim()) : []
        };

        // Send notification via AJAX
        fetch('/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.text();
            })
            .then(data => {
                showNotification('success', 'Notification sent successfully');

                // Reset form after successful submission
                setTimeout(() => {
                    resetForm();
                }, 1500);
            })
            .catch(error => {
                showNotification('error', error.message || 'Failed to send notification');
            });
    });

    // Reset form to initial state
    function resetForm() {
        typeSelect.value = "";
        objectIdInput.value = "";
        selectedObjectIdInput.value = "";
        messageInput.value = "";

        // Clear selected recipients
        recipientIdsInput.value = "";

        // Reset UI elements if they exist
        const selectedUsersContainer = document.getElementById("selectedUsersContainer");
        if (selectedUsersContainer) {
            selectedUsersContainer.innerHTML = `<p class="text-muted text-center my-2">No recipients selected</p>`;
        }

        const recipientCounter = document.getElementById("recipientCounter");
        if (recipientCounter) {
            recipientCounter.textContent = "0 recipients selected";
        }

        // Disable object modal button
        const openObjectModalBtn = document.getElementById("openObjectModal");
        if (openObjectModalBtn) {
            openObjectModalBtn.disabled = true;
        }

        // Hide clear recipients button
        if (clearRecipientsBtn) {
            clearRecipientsBtn.style.display = "none";
        }
    }

    // Validate form before submission
    function validateForm() {
        let isValid = true;
        let errorMessage = "";

        if (!typeSelect.value) {
            errorMessage = "Please select a notification type";
            isValid = false;
        }
        else if (!messageInput.value.trim()) {
            errorMessage = "Please enter a notification message";
            isValid = false;
        }
        else if (!recipientIdsInput.value) {
            errorMessage = "Please select at least one recipient";
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