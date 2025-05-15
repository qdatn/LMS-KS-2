function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    advancedFilters.classList.toggle('show');
}

function validateInputs() {
    const minRating = document.getElementById('minAverageRating').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (minRating && (minRating < 0 || minRating > 5)) {
        alert('Minimum rating must be between 0 and 5.');
        document.getElementById('minAverageRating').value = '';
        return false;
    }

    if (startDate && endDate && startDate > endDate) {
        alert('The start date must be before or equal to the end date.');
        document.getElementById('endDate').value = '';
        return false;
    }
    return true;
}

document.getElementById('searchInstructor').addEventListener('input', function() {
    const selectedOption = Array.from(document.querySelectorAll('#instructorList option'))
        .find(option => option.value === this.value);
    document.getElementById('hiddenInstructorId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});

document.getElementById('searchForm').addEventListener('submit', function(e) {
    if (!validateInputs()) {
        e.preventDefault();
    }
});

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('shadow');
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('shadow');
    });
});