function toggleSelectAll(type) {
    let selectAllCheckbox = document.getElementById(`selectAll${capitalizeFirstLetter(type)}s`);
    let checkboxes = document.querySelectorAll(`.${type}-checkbox`);

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function filterUsers() {
    let searchInput = document.getElementById('userSearch').value.toLowerCase();
    let statusFilter = document.getElementById('userStatus').value.toLowerCase();
    let userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        let username = item.querySelector('label span').textContent.toLowerCase();
        let userStatus = item.getAttribute('data-status').toLowerCase();

        if ((username.includes(searchInput) || searchInput === "") &&
            (userStatus.includes(statusFilter) || statusFilter === "")) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function filterCourses() {
    let searchInput = document.getElementById('courseSearch').value.toLowerCase();
    let courseItems = document.querySelectorAll('.course-item');

    courseItems.forEach(item => {
        let courseName = item.querySelector('label').textContent.toLowerCase();

        if (courseName.includes(searchInput)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function validateForm() {
    let location = document.getElementById('location').value;
    let usersSelected = document.querySelectorAll('.user-checkbox:checked').length;
    let coursesSelected = document.querySelectorAll('.course-checkbox:checked').length;

    // Check if location is selected
    if (!location) {
        alert("Please select a location.");
        return false;
    }

    // Check if at least one user is selected
    if (usersSelected === 0) {
        alert("Please select at least one user.");
        return false;
    }

    // Check if at least one course is selected
    if (coursesSelected === 0) {
        alert("Please select at least one course.");
        return false;
    }

    return true;
}

// Call the validateForm function before submitting the form
document.querySelector('form').onsubmit = function(event) {
    if (!validateForm()) {
        event.preventDefault(); // Prevent form submission
    }
};

function toggleSelectAll(type) {
    let selectAllCheckbox = document.getElementById(`selectAll${capitalizeFirstLetter(type)}s`);
    let checkboxes = document.querySelectorAll(`.${type}-checkbox`);

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function filterUsers() {
    let searchInput = document.getElementById('userSearch').value.toLowerCase();
    let statusFilter = document.getElementById('userStatus').value.toLowerCase();
    let userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        let username = item.querySelector('label span').textContent.toLowerCase();
        let userStatus = item.getAttribute('data-status').toLowerCase();

        if ((username.includes(searchInput) || searchInput === "") &&
            (userStatus.includes(statusFilter) || statusFilter === "")) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function filterCourses() {
    let searchInput = document.getElementById('courseSearch').value.toLowerCase();
    let courseItems = document.querySelectorAll('.course-item');

    courseItems.forEach(item => {
        let courseName = item.querySelector('label').textContent.toLowerCase();

        if (courseName.includes(searchInput)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}