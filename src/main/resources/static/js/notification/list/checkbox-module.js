const checkboxModule = {
    setupCheckboxesAndDelete: function () {
        const selectAllCheckbox = document.getElementById('selectAll');
        const itemCheckboxes = document.querySelectorAll('.selectItem');
        const deleteAllButton = document.getElementById('deleteAll');
        const deleteModal = document.getElementById('deleteModal');
        const deleteAllModal = document.getElementById('deleteAllModal');
        const selectedCount = document.getElementById('selectedCount');
        const deleteCount = document.getElementById('deleteCount');
        const deleteAllForm = document.getElementById('deleteAllForm');
        const deleteAllIdsInput = document.getElementById('deleteAllIds');
        const deleteForm = document.getElementById('deleteForm');

        this.setupSelectAllCheckbox(selectAllCheckbox, itemCheckboxes);
        this.setupDeleteModals(deleteModal, deleteAllModal, deleteCount, deleteAllIdsInput);
        this.setupDeleteForms(deleteForm, deleteAllForm, deleteAllModal, deleteModal, deleteAllIdsInput);
        this.updateDeleteButton(selectedCount, deleteAllButton);
    },

    updateDeleteButton: function (selectedCount, deleteAllButton) {
        const checkedCount = [...document.querySelectorAll('.selectItem')].filter(cb => cb.checked).length;
        if (selectedCount) selectedCount.textContent = checkedCount;
        if (deleteAllButton) deleteAllButton.disabled = checkedCount === 0;
    },

    setupSelectAllCheckbox: function (selectAllCheckbox, itemCheckboxes) {
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                document.querySelectorAll('.selectItem').forEach(cb => cb.checked = selectAllCheckbox.checked);
                this.updateDeleteButton(document.getElementById('selectedCount'), document.getElementById('deleteAll'));
            });
        }

        itemCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateDeleteButton(document.getElementById('selectedCount'), document.getElementById('deleteAll'));
            });
        });
    },

    setupDeleteModals: function (deleteModal, deleteAllModal, deleteCount, deleteAllIdsInput) {
        if (deleteAllModal) {
            deleteAllModal.addEventListener('show.bs.modal', (event) => {
                const selectedIds = [...document.querySelectorAll('.selectItem')]
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);

                if (selectedIds.length === 0) {
                    event.preventDefault();
                    alert('Please select at least one notification to delete.');
                    return;
                }

                if (deleteCount) deleteCount.textContent = selectedIds.length;
                if (deleteAllIdsInput) deleteAllIdsInput.value = JSON.stringify(selectedIds);
            });
        }

        if (deleteModal) {
            deleteModal.addEventListener('show.bs.modal', (event) => {
                const button = event.relatedTarget;
                if (!button) return;

                const id = button.getAttribute('data-id');
                if (id) {
                    const form = deleteModal.querySelector('#deleteForm');
                    if (form) form.action = `/notifications/delete/${id}`;
                }
            });
        }
    },

    setupDeleteForms: function (deleteForm, deleteAllForm, deleteAllModal, deleteModal, deleteAllIdsInput) {
        if (deleteAllForm) {
            deleteAllForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const selectedIds = JSON.parse(deleteAllIdsInput.value);

                fetch('/notifications/delete-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.getAttribute('content')
                    },
                    body: JSON.stringify({ids: selectedIds})
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to delete notifications');
                        }
                        return response.text();
                    })
                    .then(() => {
                        // Close the modal
                        const bsModal = bootstrap.Modal.getInstance(deleteAllModal);
                        if (bsModal) bsModal.hide();

                        // Refresh notifications
                        this.refreshNotificationsAfterDelete();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting notifications: ' + error.message);
                    });
            }.bind(this));
        }

        if (deleteForm) {
            deleteForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const actionUrl = deleteForm.getAttribute('action');

                fetch(actionUrl, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.getAttribute('content')
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to delete notification');
                        }
                        return response.text();
                    })
                    .then(() => {
                        const bsModal = bootstrap.Modal.getInstance(deleteModal);
                        if (bsModal) bsModal.hide();

                        this.refreshNotificationsAfterDelete();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the notification: ' + error.message);
                    });
            }.bind(this)); // Moved .bind(this) to the correct function
        }
    },

    refreshNotificationsAfterDelete: function () {
        const searchTerm = document.querySelector('input[name="searchTerm"]')?.value || '';
        const typeName = document.querySelector('select[name="typeName"]')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';

        dataModule.fetchNotifications('/notifications/get', {searchTerm, typeName, startDate, endDate});
    }
};