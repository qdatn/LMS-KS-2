// Direct inline JavaScript for view toggle
function showListView() {
    console.log("Show list view called");
    document.getElementById("listView").classList.remove("d-none");
    document.getElementById("cardView").classList.add("d-none");
    document.getElementById("listViewBtn").classList.add("active");
    document.getElementById("cardViewBtn").classList.remove("active");
    localStorage.setItem("forumManagementView", "list");
}

function showCardView() {
    console.log("Show card view called");
    document.getElementById("listView").classList.add("d-none");
    document.getElementById("cardView").classList.remove("d-none");
    document.getElementById("listViewBtn").classList.remove("active");
    document.getElementById("cardViewBtn").classList.add("active");
    localStorage.setItem("forumManagementView", "card");
}

// Initialize view based on localStorage
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    const savedView = localStorage.getItem("forumManagementView");
    console.log("Saved view:", savedView);

    if (savedView === "card") {
        showCardView();
    } else {
        showListView();
    }
});

// Function to set the delete action URL
function setDeleteAction(button) {
    const postId = button.getAttribute("data-id");
    const form = document.getElementById("deleteForm");
    form.action = "/forums/delete/" + postId + "?redirect=/forums/management";
}

function togglePostVisibility(postId) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/forums/toggle-hide/${postId}?redirect=/forums/management`;
    document.body.appendChild(form);
    form.submit();
}

// Date validation for filter
document.addEventListener("DOMContentLoaded", function() {
    const startDateSelect = document.getElementById("startDateSelect");
    const endDateSelect = document.getElementById("endDateSelect");
    const dateError = document.getElementById("dateError");
    const applyFiltersBtn = document.getElementById("applyFilters");

    if (startDateSelect && endDateSelect && dateError && applyFiltersBtn) {
        function validateDates() {
            dateError.classList.add("d-none");
            if (startDateSelect.value && endDateSelect.value) {
                if (new Date(startDateSelect.value) > new Date(endDateSelect.value)) {
                    dateError.classList.remove("d-none");
                    return false;
                }
            }
            return true;
        }

        startDateSelect.addEventListener("change", validateDates);
        endDateSelect.addEventListener("change", validateDates);

        applyFiltersBtn.addEventListener("click", function() {
            if (validateDates()) {
                const courseIdInput = document.getElementById("courseIdInput");
                const startDateInput = document.getElementById("startDateInput");
                const endDateInput = document.getElementById("endDateInput");
                const courseSelect = document.getElementById("courseSelect");

                if (courseIdInput && courseSelect) {
                    courseIdInput.value = courseSelect.value;
                }

                if (startDateInput) {
                    startDateInput.value = startDateSelect.value;
                }

                if (endDateInput) {
                    endDateInput.value = endDateSelect.value;
                }

                const searchForm = document.getElementById("searchForm");
                if (searchForm) {
                    searchForm.submit();
                }
            }
        });
    }
});