function toggleAdvancedFilters() {
    const filterSection = document.getElementById('advancedFilters');
    filterSection.classList.toggle('show');
}

function submitIfNoAdvanced(form) {
    const filterSection = document.getElementById('advancedFilters');
    if (!filterSection.classList.contains('show')) {
        form.submit();
    }
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

document.getElementById('searchAdmin').addEventListener('input', function() {
    const inputValue = this.value;
    const selectedOption = Array.from(document.querySelectorAll('#instructorList option'))
        .find(option => option.value.toLowerCase() === inputValue.toLowerCase());
    document.getElementById('hiddenAdminId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});

document.getElementById('searchForm').addEventListener('submit', function(e) {
    if (!validateDateRange()) {
        e.preventDefault();
    }
});