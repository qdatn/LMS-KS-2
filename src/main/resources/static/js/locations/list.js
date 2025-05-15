function showListView() {
    console.log('Showing list view');
    document.getElementById('listView').style.display = 'block';
    document.getElementById('cardView').style.display = 'none';
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('cardViewBtn').classList.remove('active');
    localStorage.setItem('locationsViewPreference', 'list');
}

function showCardView() {
    console.log('Showing card view');
    document.getElementById('listView').style.display = 'none';
    document.getElementById('cardView').style.display = 'block';
    document.getElementById('listViewBtn').classList.remove('active');
    document.getElementById('cardViewBtn').classList.add('active');
    localStorage.setItem('locationsViewPreference', 'card');
}

// Initialize view based on localStorage
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing view');
    const viewPreference = localStorage.getItem('locationsViewPreference');
    console.log('View preference:', viewPreference);

    if (viewPreference === 'card') {
        showCardView();
    } else {
        showListView();
    }
});

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
        deleteAllButton.disabled = checkedCount === 0;
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

    // Handle "Delete Selected" modal display
    deleteAllModal.addEventListener('show.bs.modal', (event) => {
        const selectedIds = [...itemCheckboxes]
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedIds.length === 0) {
            event.preventDefault();
            alert('Please select at least one location to delete.');
            return;
        }

        deleteCount.textContent = selectedIds.length;
        deleteAllIdsInput.value = JSON.stringify(selectedIds);
    });

    // Handle single delete modal
    deleteModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-id');
        if (id) {
            const form = deleteModal.querySelector('#deleteForm');
            form.action = `/locations/delete/${id}`;
        }
    });

    // Handle "Delete Selected" form submission
    deleteAllForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedIds = JSON.parse(deleteAllIdsInput.value);

        fetch('/locations/delete-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedIds })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete locations');
                }
                return response.text();
            })
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting locations: ' + error.message);
            });
    });

    // Handle "Delete All" modal close
    deleteAllModal.addEventListener('hidden.bs.modal', () => {
        deleteCount.textContent = '0';
        deleteAllIdsInput.value = '';
    });

    // Initialize initial state
    updateDeleteButton();

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});