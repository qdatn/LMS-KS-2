// Định nghĩa hàm ở phạm vi toàn cục để có thể gọi từ onclick
function exportWithFilter() {
    try {
        const keyword =
            document.querySelector('input[name="keyword"]')?.value || "";
        const startDate =
            document.querySelector('input[name="startDate"]')?.value || "";
        const endDate =
            document.querySelector('input[name="endDate"]')?.value || "";
        const type =
            document.querySelector('select[name="type"]')?.value || "";

        console.log("Filter params:", { keyword, startDate, endDate, type });

        // Tạo URL trực tiếp thay vì dùng fetch
        let url = "/activities/export-with-filter?";
        if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
        if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
        if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;
        if (type) url += `type=${encodeURIComponent(type)}`;

        console.log("Export URL:", url);
        window.location.href = url;
    } catch (error) {
        console.error("Export error:", error);
        alert("Lỗi khi xuất dữ liệu: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const selectAllCheckbox = document.getElementById("selectAll");
    const itemCheckboxes = document.querySelectorAll(".selectItem");
    const deleteAllButton = document.getElementById("deleteAll");
    const deleteModal = document.getElementById("deleteModal");
    const deleteAllModal = document.getElementById("deleteAllModal");
    const selectedCount = document.getElementById("selectedCount");
    const deleteCount = document.getElementById("deleteCount");
    const deleteAllForm = document.getElementById("deleteAllForm");
    const deleteAllIdsInput = document.getElementById("deleteAllIds");

    function updateDeleteButton() {
        const checkedCount = [...itemCheckboxes].filter(
            (cb) => cb.checked
        ).length;
        selectedCount.textContent = checkedCount;
        deleteAllButton.disabled = checkedCount === 0;
    }

    selectAllCheckbox.addEventListener("change", () => {
        itemCheckboxes.forEach(
            (cb) => (cb.checked = selectAllCheckbox.checked)
        );
        updateDeleteButton();
    });

    itemCheckboxes.forEach((cb) => {
        cb.addEventListener("change", updateDeleteButton);
    });

    deleteAllModal.addEventListener("show.bs.modal", (event) => {
        const selectedIds = [...itemCheckboxes]
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);

        if (selectedIds.length === 0) {
            event.preventDefault();
            alert("Please select at least one activity to delete.");
            return;
        }

        deleteCount.textContent = selectedIds.length;
        deleteAllIdsInput.value = selectedIds.join(",");
    });

    deleteModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute("data-id");
        if (id) {
            const form = deleteModal.querySelector("#deleteForm");
            form.action = form.action.replace("__ID__", id);
        }
    });

    deleteAllForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const selectedIds = deleteAllIdsInput.value;

        fetch("/activities/delete-selected", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `ids=${selectedIds}`,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete activities");
                }
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(
                    "An error occurred while deleting activities: " + error.message
                );
            });
    });

    deleteAllModal.addEventListener("hidden.bs.modal", () => {
        deleteCount.textContent = "0";
        deleteAllIdsInput.value = "";
    });

    updateDeleteButton();

    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    // Giữ lại phần xử lý submit form
    document
        .getElementById("deleteAllActivitiesForm")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const response = await fetch("/activities/delete-all", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete all activities");
                }

                // Hiển thị thông báo thành công
                alert("All activities have been deleted successfully");

                // Reload trang
                window.location.reload();
            } catch (error) {
                console.error("Error:", error);
                alert(
                    "An error occurred while deleting all activities: " +
                    error.message
                );
            }
        });

    const gridViewBtn = document.getElementById('gridViewBtn');
    const tableContainer = document.querySelector('.table-container');
    const activityTableBody = document.getElementById('activityTableBody');
    const gridContainer = document.querySelector('.grid-container');
    let isGridView = false;

    gridViewBtn.addEventListener('click', function() {
        isGridView = !isGridView;
        
        if (isGridView) {
            // Chuyển sang grid view
            if (tableContainer) tableContainer.style.display = 'none';
            if (gridContainer) gridContainer.style.display = 'grid';
            gridViewBtn.innerHTML = '<i class="fas fa-list"></i>';
            gridViewBtn.title = 'List View';
            
            // Tạo grid items từ dữ liệu bảng
            if (activityTableBody && gridContainer) {
                const rows = activityTableBody.querySelectorAll('tr');
                gridContainer.innerHTML = '';
                
                rows.forEach(row => {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'grid-item card shadow-sm';
                    
                    // Lấy dữ liệu từ các ô trong hàng
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 6) { // Đảm bảo có đủ số ô
                        const action = cells[2].textContent.trim();
                        const method = cells[3].innerHTML;
                        const timestamp = cells[4].textContent.trim();
                        const type = cells[5].innerHTML;
                        
                        gridItem.innerHTML = `
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div class="method-badge">${method}</div>
                                    <div class="type-badge">${type}</div>
                                </div>
                                <h6 class="card-title text-truncate" title="${action}">${action}</h6>
                                <div class="card-text text-muted">
                                    <small><i class="fas fa-calendar-day me-1"></i>${timestamp}</small>
                                </div>
                            </div>
                        `;
                        
                        // Thêm sự kiện click để chuyển đến trang chi tiết
                        gridItem.addEventListener('click', function() {
                            const checkbox = row.querySelector('.selectItem');
                            if (checkbox) {
                                window.location.href = `/activities/details/${checkbox.value}`;
                            }
                        });
                        
                        gridContainer.appendChild(gridItem);
                    }
                });
            }
        } else {
            // Chuyển về table view
            if (tableContainer) tableContainer.style.display = 'block';
            if (gridContainer) gridContainer.style.display = 'none';
            gridViewBtn.innerHTML = '<i class="fas fa-th"></i>';
            gridViewBtn.title = 'Grid View';
        }
    });
});