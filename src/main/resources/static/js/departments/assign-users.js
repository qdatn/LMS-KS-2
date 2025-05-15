let originalAvailableUsers = [];
let originalSelectedUsers = [];

window.addEventListener("DOMContentLoaded", () => {
    // Khởi tạo dữ liệu gốc khi trang load
    originalAvailableUsers = Array.from(document.querySelectorAll('#availableUserList .user-item')).map(el => ({
        id: el.getAttribute('data-userid'),
        username: el.getAttribute('data-username')
    }));

    originalSelectedUsers = Array.from(document.querySelectorAll('#selectedUserList .user-item')).map(el => ({
        id: el.getAttribute('data-userid'),
        username: el.getAttribute('data-username')
    }));

    renderAvailableUsers(originalAvailableUsers);
    renderSelectedUsers(originalSelectedUsers);
});

function renderAvailableUsers(users) {
    const container = document.getElementById('availableUserList');
    container.innerHTML = "";
    users.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item p-2 rounded-2 hover-effect d-flex align-items-center mb-2 bg-white shadow-sm";
        div.setAttribute("data-userid", user.id);
        div.setAttribute("data-username", user.username.toLowerCase());
        div.innerHTML = `
                <span class="flex-grow-1 text-dark">${user.username}</span>
                <button type="button" class="btn btn-sm btn-outline-success" onclick="addUserById('${user.id}')">
                    <i class="bi bi-plus-circle me-1"></i>Add
                </button>`;
        container.appendChild(div);
    });
}

function renderSelectedUsers(users) {
    const container = document.getElementById('selectedUserList');
    container.innerHTML = "";
    users.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item p-2 rounded-2 hover-effect d-flex align-items-center mb-2 bg-white shadow-sm";
        div.setAttribute("data-userid", user.id);
        div.setAttribute("data-username", user.username.toLowerCase());
        div.innerHTML = `
                <span class="flex-grow-1 text-dark">${user.username}</span>
                <input type="hidden" name="users" value="${user.id}" />
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeUserById('${user.id}')">
                    <i class="bi bi-dash-circle me-1"></i>Remove
                </button>`;
        container.appendChild(div);
    });
}

function filterAvailableUsers() {
    const keyword = document.getElementById("availableUserSearch").value.toLowerCase();
    const filtered = originalAvailableUsers.filter(user => user.username.toLowerCase().includes(keyword));
    renderAvailableUsers(filtered);
}

function filterSelectedUsers() {
    const keyword = document.getElementById("selectedUserSearch").value.toLowerCase();
    const filtered = originalSelectedUsers.filter(user => user.username.toLowerCase().includes(keyword));
    renderSelectedUsers(filtered);
}

function addUserById(userId) {
    const user = originalAvailableUsers.find(u => u.id === userId);
    if (!user) return;
    originalAvailableUsers = originalAvailableUsers.filter(u => u.id !== userId);
    originalSelectedUsers.push(user);
    renderAvailableUsers(originalAvailableUsers);
    renderSelectedUsers(originalSelectedUsers);
}

function removeUserById(userId) {
    const user = originalSelectedUsers.find(u => u.id === userId);
    if (!user) return;
    originalSelectedUsers = originalSelectedUsers.filter(u => u.id !== userId);
    originalAvailableUsers.push(user);
    renderAvailableUsers(originalAvailableUsers);
    renderSelectedUsers(originalSelectedUsers);
}

function addAllUsers() {
    originalSelectedUsers = [...originalSelectedUsers, ...originalAvailableUsers];
    originalAvailableUsers = [];
    renderAvailableUsers(originalAvailableUsers);
    renderSelectedUsers(originalSelectedUsers);
}

function removeAllUsers() {
    originalAvailableUsers = [...originalAvailableUsers, ...originalSelectedUsers];
    originalSelectedUsers = [];
    renderAvailableUsers(originalAvailableUsers);
    renderSelectedUsers(originalSelectedUsers);
}

function ensureUsersParameter() {
    if (originalSelectedUsers.length === 0) {
        document.querySelector('input[name="users"][type="hidden"]').value = "";
    }
}