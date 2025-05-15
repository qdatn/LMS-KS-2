// Toggle filter form visibility
function toggleFilter() {
    const filterForm = document.getElementById('filterForm');
    filterForm.classList.toggle('show');
}

// Validate date range
function validateDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate && startDate > endDate) {
        alert('The start date must be before or equal to the end date.');
        document.getElementById('endDate').value = '';
        return false;
    }
    return true;
}

// Update rating select color
function updateRatingColor(selectElement) {
    const ratingValue = selectElement.value;
    selectElement.style.color = ratingValue ? '#ffc107' : '#212529';
}

// Handle course search input
document.getElementById('searchCourse').addEventListener('input', function() {
    const selectedOption = Array.from(document.querySelectorAll('#courseList option'))
        .find(option => option.value === this.value);
    document.getElementById('selectedCourseId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});

// Validate form on submit
document.getElementById('searchForm').addEventListener('submit', function(e) {
    if (!validateDateRange()) {
        e.preventDefault();
    }
});

// Hover effect for cards (optional enhancement)
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('shadow');
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('shadow');
    });
});