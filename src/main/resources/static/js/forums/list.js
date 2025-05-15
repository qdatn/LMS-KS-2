<!-- JavaScript to handle filter modal and view toggle -->
document.addEventListener('DOMContentLoaded', function () {
    // Get references to form elements
    const searchForm = document.getElementById('searchForm');
    const filterForm = document.getElementById('filterForm');
    const applyFiltersBtn = document.getElementById('applyFilters');

    // Hidden inputs in the main form
    const courseIdInput = document.getElementById('courseIdInput');
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');
    const viewModeInput = document.getElementById('viewModeInput');

    // Modal select elements
    const courseSelect = document.getElementById('courseSelect');
    const startDateSelect = document.getElementById('startDateSelect');
    const endDateSelect = document.getElementById('endDateSelect');
    const dateError = document.getElementById('dateError');

    // View toggle elements
    const listViewBtn = document.getElementById('listViewBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const listView = document.getElementById('listView');
    const cardView = document.getElementById('cardView');

    // Check if there's a saved view preference in localStorage
    const savedViewMode = localStorage.getItem('forumViewMode');
    if (savedViewMode === 'card') {
        showCardView();
    }

    // View toggle handlers
    listViewBtn.addEventListener('click', function () {
        showListView();
        localStorage.setItem('forumViewMode', 'list');
    });

    cardViewBtn.addEventListener('click', function () {
        showCardView();
        localStorage.setItem('forumViewMode', 'card');
    });

    function showListView() {
        listView.classList.remove('d-none');
        cardView.classList.add('d-none');
        listViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        viewModeInput.value = 'list';
    }

    function showCardView() {
        listView.classList.add('d-none');
        cardView.classList.remove('d-none');
        listViewBtn.classList.remove('active');
        cardViewBtn.classList.add('active');
        viewModeInput.value = 'card';
    }

    // Date validation function
    function validateDates() {
        // Clear previous error
        dateError.classList.add('d-none');

        // Get date values
        const startDate = startDateSelect.value;
        const endDate = endDateSelect.value;

        // Only validate if both dates are selected
        if (startDate && endDate) {
            // Compare dates
            if (new Date(startDate) > new Date(endDate)) {
                // Show error message
                dateError.classList.remove('d-none');
                return false;
            }
        }
        return true;
    }

    // Add validation on date change
    startDateSelect.addEventListener('change', validateDates);
    endDateSelect.addEventListener('change', validateDates);

    // Apply filters button click handler with validation
    applyFiltersBtn.addEventListener('click', function () {
        // Validate dates before submitting
        if (validateDates()) {
            // Update hidden inputs with selected values
            courseIdInput.value = courseSelect.value;
            startDateInput.value = startDateSelect.value;
            endDateInput.value = endDateSelect.value;

            // Submit the main form
            searchForm.submit();

            // Close the modal (optional, as the page will reload)
            const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
            if (modal) {
                modal.hide();
            }
        }
    });
});