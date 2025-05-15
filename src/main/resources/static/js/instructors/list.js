document.addEventListener('DOMContentLoaded', () => {
    const selectAllCheckbox = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.selectItem');
    const deleteAllButton = document.getElementById('deleteAll');
    const deleteModal = document.getElementById('deleteModal');
    const deleteAllModal = document.getElementById('deleteAllModal');
    const selectedCount = document.getElementById('selectedCount');
    const deleteCount = document.getElementById('deleteCount');
    const deleteAllForm = document.getElementById('deleteAllForm');
    const deleteAllIdsInput = document.getElementById('deleteAllIds');

    function updateDeleteButton() {
        const checkedCount = [...itemCheckboxes].filter(cb => cb.checked).length;
        selectedCount.textContent = checkedCount;
        deleteAllButton.disabled = checkedCount === 0; // Disable button if no items selected
    }

    // Handle "Select All" checkbox
    selectAllCheckbox.addEventListener('change', () => {
        itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
        updateDeleteButton();
    });

    // Update when individual checkboxes change
    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateDeleteButton);
    });

    // Handle displaying "Delete Selected" modal
    deleteAllModal.addEventListener('show.bs.modal', (event) => {
        const selectedIds = [...itemCheckboxes]
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedIds.length === 0) {
            event.preventDefault(); // Prevent modal from showing if no items selected
            alert('Please select at least one instructor to delete.');
            return;
        }

        deleteCount.textContent = selectedIds.length;
        deleteAllIdsInput.value = JSON.stringify(selectedIds);
    });

    // Handle delete modal for individual instructor
    deleteModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-id');
        if (id) {
            const form = deleteModal.querySelector('#deleteForm');
            form.action = `/instructors/delete/${id}`;
        }
    });

    // Handle "Delete Selected" form submission
    deleteAllForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedIds = JSON.parse(deleteAllIdsInput.value);

        fetch('/instructors/delete-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete instructors');
            }
            return response.text();
        })
        .then(() => {
            window.location.reload(); // Reload page after successful deletion
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting instructors: ' + error.message);
        });
    });

    // Handle when "Delete All" modal is closed (including Cancel button)
    deleteAllModal.addEventListener('hidden.bs.modal', () => {
        // Reset data if needed
        deleteCount.textContent = '0';
        deleteAllIdsInput.value = '';
    });

    // Initialize initial state
    updateDeleteButton();

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});