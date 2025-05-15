function toggleFilter() {
    const filterForm = document.getElementById('filterForm');
    filterForm.classList.toggle('show');
}

function validateDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate && startDate > endDate) {
        alert('The start date must be before the end date.');
        document.getElementById('endDate').value = '';
        return false;
    }
    return true;
}

function updateRatingColor(selectElement) {
    const ratingValue = selectElement.value;
    selectElement.style.color = ratingValue ? '#ffc107' : '#000'; // Vàng cho rating, đen cho "All"
}

document.getElementById('searchCourse').addEventListener('input', function() {
    const selectedOption = Array.from(document.querySelectorAll('#courseList option'))
        .find(option => option.value === this.value);
    document.getElementById('selectedCourseId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});

document.getElementById('searchForm').addEventListener('submit', function(e) {
    if (!validateDateRange()) {
        e.preventDefault();
    }
});

// Giữ nguyên các hàm từ code gốc
function toggleAdvancedFilters() {
    var filterSection = document.getElementById("filterForm");
    if (filterSection.style.display === "none") {
        filterSection.style.display = "block";
    } else {
        filterSection.style.display = "none";
    }
}

function submitIfNoAdvanced(form) {
    var filterSection = document.getElementById("filterForm");
    if (filterSection.style.display === "none") {
        form.submit();
    }
}