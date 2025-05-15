document.getElementById('searchCourse').addEventListener('input', function() {
    const selectedOption = Array.from(document.querySelectorAll('#courseList option'))
        .find(option => option.value === this.value);
    document.getElementById('selectedCourseId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});
document.getElementById('searchInstructor').addEventListener('input', function() {
    const inputValue = this.value;
    const selectedOption = Array.from(document.querySelectorAll('#instructorList option'))
        .find(option => option.value.toLowerCase() === inputValue.toLowerCase());
    document.getElementById('hiddenInstructorId').value = selectedOption ? selectedOption.getAttribute('data-id') : '';
});
function toggleFilterInstructor() {
    const filterForm = document.getElementById('filterFormInstructor');
    filterForm.classList.toggle('show');
}
function toggleFilterCourse() {
    const filterForm = document.getElementById('filterFormCourse');
    filterForm.classList.toggle('show');
}
function updateRatingColor(selectElement) {
    const ratingValue = selectElement.value;
    selectElement.style.color = ratingValue ? '#ffc107' : '#000'; // Vàng cho rating, đen cho "All"
}
document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra nếu có tab đã lưu trong localStorage thì kích hoạt nó
    let activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
        let tab = document.querySelector(`#feedbackTabs button[data-bs-target="${activeTab}"]`);
        if (tab) {
            new bootstrap.Tab(tab).show();
        }
    }

    // Bắt sự kiện click vào tab và lưu vào localStorage
    document.querySelectorAll("#feedbackTabs button[data-bs-toggle='tab']").forEach(tab => {
        tab.addEventListener("shown.bs.tab", function (event) {
            let selectedTab = event.target.getAttribute("data-bs-target");
            localStorage.setItem("activeTab", selectedTab);
        });
    });
});