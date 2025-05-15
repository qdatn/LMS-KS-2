document.addEventListener('DOMContentLoaded', function () {
    // Checkbox và logic xóa
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

    // Xử lý modal xóa nhiều role
    if (deleteAllModal) {
        deleteAllModal.addEventListener('show.bs.modal', (event) => {
            const selectedIds = [...itemCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            if (selectedIds.length === 0) {
                event.preventDefault();
                alert('Please select at least one role to delete.');
                return;
            }
            deleteCount.textContent = selectedIds.length;
            deleteAllIdsInput.value = JSON.stringify(selectedIds);
        });
    }

    // Xử lý modal xóa từng role
    if (deleteModal) {
        deleteModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const id = button.getAttribute('data-id');
            if (id) {
                const form = deleteModal.querySelector('#deleteForm');
                form.action = `/api/v1/roles/${id}`;
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
                                throw new Error(data.error || 'Failed to delete role');
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

    // Xử lý submit form xóa nhiều role
    const deleteAllForm = document.getElementById('deleteAllForm');
    if(deleteAllForm) {
        deleteAllForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedIds = JSON.parse(deleteAllIdsInput.value);
            fetch('/api/v1/roles/delete-all', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedIds)
            })
            .then(response => response.json().then(json => ({status: response.status, body: json})))
            .then(({status, body}) => {
                if (status >= 200 && status < 300) {
                    const bsModal = bootstrap.Modal.getInstance(deleteAllModal);
                    if (bsModal) bsModal.hide();
                    window.location.reload();
                } else {
                    alert(body.error || 'Failed to delete roles.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting roles: ' + error.message);
            });
        });
    }

    // Reset lại khi đóng modal xóa nhiều
    if (deleteAllModal) {
        deleteAllModal.addEventListener('hidden.bs.modal', () => {
            deleteCount.textContent = '0';
            deleteAllIdsInput.value = '';
        });
    }

    // --- View Toggle Logic ---
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const tableView = document.getElementById('roleTableView');
    const gridView = document.getElementById('roleGridView');

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
        localStorage.setItem('roleView', view);
    }

    if (listViewBtn && gridViewBtn && tableView && gridView) {
        listViewBtn.addEventListener('click', () => setView('list'));
        gridViewBtn.addEventListener('click', () => setView('grid'));
        // On page load, restore view
        const savedView = localStorage.getItem('roleView') || 'list';
        setView(savedView);
    }

    // Khởi tạo trạng thái ban đầu
    updateDeleteButton();
    // Tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
