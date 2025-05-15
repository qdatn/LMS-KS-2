function addUser(checkbox) {
    if (checkbox.checked) {
        selectedUsers.add(checkbox.value);
    } else {
        selectedUsers.delete(checkbox.value);
    }
    updateSelectedUsers();
    updateSelectAllCheckbox();
}

function updateSelectedUsers() {
    let container = document.getElementById("selectedUsersContainer");
    container.innerHTML = "";

    selectedUsers.forEach(userId => {
        let userElement = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (userElement) {
            let userName = userElement.nextElementSibling.textContent;
            let userTag = document.createElement("span");
            userTag.classList.add("badge", "bg-primary", "me-1", "p-2");
            userTag.innerHTML = `${userName} <i class="bi bi-x-lg ms-1" onclick="removeUser('${userId}')"></i>`;
            container.appendChild(userTag);
        }
    });

    document.getElementById("recipientIds").value = Array.from(selectedUsers).join(',');
}

function removeUser(userId) {
    selectedUsers.delete(userId);
    let checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
    if (checkbox) checkbox.checked = false;

    updateSelectedUsers();
    updateSelectAllCheckbox();
}

function filterUsers() {
    let input = document.getElementById("searchUsers").value.toLowerCase();
    document.querySelectorAll(".user-item").forEach(userItem => {
        let label = userItem.querySelector("label").textContent.toLowerCase();
        userItem.style.display = label.includes(input) ? "" : "none";
    });

    updateSelectAllCheckbox();
}

function toggleSelectAll() {
    let selectAllCheckbox = document.getElementById("selectAll");
    let visibleUsers = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");

    visibleUsers.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        if (selectAllCheckbox.checked) {
            selectedUsers.add(checkbox.value);
        } else {
            selectedUsers.delete(checkbox.value);
        }
    });

    updateSelectedUsers();
}

function updateSelectAllCheckbox() {
    let visibleUsers = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");

    let checkedCount = Array.from(visibleUsers).filter(checkbox => checkbox.checked).length;
    document.getElementById("selectAll").checked = (visibleUsers.length > 0 && checkedCount === visibleUsers.length);
}