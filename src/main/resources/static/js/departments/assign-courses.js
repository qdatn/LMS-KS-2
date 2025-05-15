let originalAvailableCourses = [];
let originalSelectedCourses = [];

window.addEventListener("DOMContentLoaded", () => {
    originalAvailableCourses = Array.from(document.querySelectorAll('#availableCourseList .course-item')).map(el => ({
        id: el.getAttribute('data-courseid'),
        name: el.getAttribute('data-coursename')
    }));

    originalSelectedCourses = Array.from(document.querySelectorAll('#selectedCourseList .course-item')).map(el => ({
        id: el.getAttribute('data-courseid'),
        name: el.getAttribute('data-coursename')
    }));

    renderAvailableCourses(originalAvailableCourses);
    renderSelectedCourses(originalSelectedCourses);
});

function renderAvailableCourses(courses) {
    const container = document.getElementById('availableCourseList');
    container.innerHTML = "";
    courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-item p-2 rounded-2 hover-effect d-flex align-items-center mb-2 bg-white shadow-sm";
        div.setAttribute("data-courseid", course.id);
        div.setAttribute("data-coursename", course.name.toLowerCase());
        div.innerHTML = `
            <span class="flex-grow-1 text-dark">${course.name}</span>
            <button type="button" class="btn btn-sm btn-outline-success" onclick="addCourseById('${course.id}')">
                <i class="bi bi-plus-circle me-1"></i>Add
            </button>`;
        container.appendChild(div);
    });
}

function renderSelectedCourses(courses) {
    const container = document.getElementById('selectedCourseList');
    container.innerHTML = "";
    courses.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-item p-2 rounded-2 hover-effect d-flex align-items-center mb-2 bg-white shadow-sm";
        div.setAttribute("data-courseid", course.id);
        div.setAttribute("data-coursename", course.name.toLowerCase());
        div.innerHTML = `
            <span class="flex-grow-1 text-dark">${course.name}</span>
            <input type="hidden" name="courses" value="${course.id}" />
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeCourseById('${course.id}')">
                <i class="bi bi-dash-circle me-1"></i>Remove
            </button>`;
        container.appendChild(div);
    });
}

function filterAvailableCourses() {
    const keyword = document.getElementById("availableCourseSearch").value.toLowerCase();
    const filtered = originalAvailableCourses.filter(course => course.name.toLowerCase().includes(keyword));
    renderAvailableCourses(filtered);
}

function filterSelectedCourses() {
    const keyword = document.getElementById("selectedCourseSearch").value.toLowerCase();
    const filtered = originalSelectedCourses.filter(course => course.name.toLowerCase().includes(keyword));
    renderSelectedCourses(filtered);
}

function addCourseById(courseId) {
    const course = originalAvailableCourses.find(c => c.id === courseId);
    if (!course) return;
    originalAvailableCourses = originalAvailableCourses.filter(c => c.id !== courseId);
    originalSelectedCourses.push(course);
    renderAvailableCourses(originalAvailableCourses);
    renderSelectedCourses(originalSelectedCourses);
}

function removeCourseById(courseId) {
    const course = originalSelectedCourses.find(c => c.id === courseId);
    if (!course) return;
    originalSelectedCourses = originalSelectedCourses.filter(c => c.id !== courseId);
    originalAvailableCourses.push(course);
    renderAvailableCourses(originalAvailableCourses);
    renderSelectedCourses(originalSelectedCourses);
}

function addAllCourses() {
    originalSelectedCourses = [...originalSelectedCourses, ...originalAvailableCourses];
    originalAvailableCourses = [];
    renderAvailableCourses(originalAvailableCourses);
    renderSelectedCourses(originalSelectedCourses);
}

function removeAllCourses() {
    originalAvailableCourses = [...originalAvailableCourses, ...originalSelectedCourses];
    originalSelectedCourses = [];
    renderAvailableCourses(originalAvailableCourses);
    renderSelectedCourses(originalSelectedCourses);
}

function ensureCoursesParameter() {
    if (originalSelectedCourses.length === 0) {
        document.querySelector('input[name="courses"][type="hidden"]').value = "";
    }
}