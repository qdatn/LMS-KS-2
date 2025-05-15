document.addEventListener('DOMContentLoaded', function () {
    // Reload users button logic
    const reloadBtn = document.getElementById('reloadUsersBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', function() {
            const page = 0;
            const size = window.userListPageSize || 10;
            // Reloads only the user list section if possible, otherwise reloads the whole page
            // For now, fallback to full reload
            window.location.href = `/users?page=${page}&size=${size}`;
        });
    }

    // Checkbox and delete logic
    const selectAllCheckbox = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.selectItem');
    const deleteAllButton = document.getElementById('deleteAll');
    const deleteModal = document.getElementById('deleteModal');
    const deleteAllModal = document.getElementById('deleteAllModal');
    const selectedCount = document.getElementById('selectedCount');
    const deleteCount = document.getElementById('deleteCount');
    const deleteAllIdsInput = document.getElementById('deleteAllIds');

    function updateDeleteButton() {
        const checkedCount = [...itemCheckboxes].filter(cb => cb.checked).length;
        selectedCount.textContent = checkedCount;
        deleteAllButton.disabled = checkedCount === 0;
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
            updateDeleteButton();
        });
    }
    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateDeleteButton);
    });

    // Search form
    const searchForm = document.querySelector('form[action="/users"]');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('input[name="searchTerm"]').value;
            const page = 0;
            const size = window.userListPageSize || 10;
            window.location.href = `/users?page=${page}&size=${size}&searchTerm=${encodeURIComponent(searchTerm)}`;
        });
    }

    // Delete selected modal
    if (deleteAllModal) {
        deleteAllModal.addEventListener('show.bs.modal', (event) => {
            const selectedIds = [...itemCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedIds.length === 0) {
                event.preventDefault();
                alert('Please select at least one user to delete.');
                return;
            }

            deleteCount.textContent = selectedIds.length;
            deleteAllIdsInput.value = JSON.stringify(selectedIds);
        });
    }

    // Delete single user modal
    if (deleteModal) {
        deleteModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const id = button.getAttribute('data-id');
            if (id) {
                const form = deleteModal.querySelector('#deleteForm');
                form.action = `/api/v1/users/${id}`;
                
                form.onsubmit = function(e) {
                    e.preventDefault();
                    fetch(this.action, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            location.reload();
                        } else {
                            return response.json().then(data => {
                                throw new Error(data.error || 'Failed to delete user');
                            });
                        }
                    })
                    .catch(error => {
                        alert(error.message);
                    });
                    
                    // Close the modal
                    const bsModal = bootstrap.Modal.getInstance(deleteModal);
                    if (bsModal) bsModal.hide();
                };
            }
        });
    }

    const deleteAllForm = document.getElementById('deleteAllForm');
    const deleteAllIds = document.getElementById('deleteAllIds');
    if(deleteAllForm) {
        deleteAllForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedIds = JSON.parse(deleteAllIds.value);
            console.log('Selected IDs:', selectedIds);


            fetch('/api/v1/users/delete-all', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedIds)
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                    const bsModal = bootstrap.Modal.getInstance(deleteAllModal);
                    if (bsModal) bsModal.hide();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to delete users.');
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting users: ' + error.message);
            });
        });
    }

    // --- View Toggle Logic ---
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const tableView = document.getElementById('userTableView');
    const gridView = document.getElementById('userGridView');

    function setView(view) {
        if (view === 'grid') {
            gridView.classList.remove('d-none');
            tableView.classList.add('d-none');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            gridView.classList.add('d-none');
            tableView.classList.remove('d-none');
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
        }
        localStorage.setItem('userView', view);
    }

    if (listViewBtn && gridViewBtn && tableView && gridView) {
        listViewBtn.addEventListener('click', () => setView('list'));
        gridViewBtn.addEventListener('click', () => setView('grid'));
        // On page load, restore view
        const savedView = localStorage.getItem('userView') || 'list';
        setView(savedView);
    }
});
