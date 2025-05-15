function showListView() {
    console.log('Showing list view');
    document.getElementById('listView').style.display = 'block';
    document.getElementById('cardView').style.display = 'none';
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('cardViewBtn').classList.remove('active');
    localStorage.setItem('departmentsViewPreference', 'list');
}

function showCardView() {
    console.log('Showing card view');
    document.getElementById('listView').style.display = 'none';
    document.getElementById('cardView').style.display = 'block';
    document.getElementById('listViewBtn').classList.remove('active');
    document.getElementById('cardViewBtn').classList.add('active');
    localStorage.setItem('departmentsViewPreference', 'card');
}

// Initialize view based on localStorage preference
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    try {
        const viewPreference = localStorage.getItem('departmentsViewPreference');
        console.log('View preference:', viewPreference);

        if (viewPreference === 'card') {
            showCardView();
        } else {
            showListView();
        }
    } catch (error) {
        console.error('Error initializing view:', error);
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
        deleteAllButton.disabled = checkedCount === 0; // Vô hiệu hóa nút nếu không có mục nào được chọn
    }

    // Xử lý checkbox "Select All"
    selectAllCheckbox.addEventListener('change', () => {
        itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
        updateDeleteButton();
    });

    // Cập nhật khi checkbox riêng lẻ thay đổi
    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateDeleteButton);
    });

    // Xử lý hiển thị modal "Delete Selected"
    deleteAllModal.addEventListener('show.bs.modal', (event) => {
        const selectedIds = [...itemCheckboxes]
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedIds.length === 0) {
            event.preventDefault(); // Ngăn modal hiển thị nếu không có mục nào được chọn
            alert('Please select at least one department to delete.');
            return;
        }

        deleteCount.textContent = selectedIds.length;
        deleteAllIdsInput.value = JSON.stringify(selectedIds);
    });

    // Xử lý modal xóa từng department
    deleteModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-id');
        if (id) {
            const form = deleteModal.querySelector('#deleteForm');
            form.action = `/departments/delete/${id}`;
        }
    });

    // Xử lý submit form "Delete Selected"
    deleteAllForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedIds = JSON.parse(deleteAllIdsInput.value);

        fetch('/departments/delete-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedIds })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete departments');
                }
                return response.text();
            })
            .then(() => {
                window.location.reload(); // Tải lại trang sau khi xóa thành công
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting departments: ' + error.message);
            });
    });

    // Xử lý khi modal "Delete All" bị đóng (bao gồm nút Cancel)
    deleteAllModal.addEventListener('hidden.bs.modal', () => {
        // Reset dữ liệu nếu cần
        deleteCount.textContent = '0';
        deleteAllIdsInput.value = '';
    });

    // Khởi tạo trạng thái ban đầu
    updateDeleteButton();

    // Khởi tạo tooltip của Bootstrap
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});