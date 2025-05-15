class RecipientManager {
    constructor() {
        // Recipient selection elements
        this.selectedUsersContainer = document.getElementById("selectedUsersContainer");
        this.selectedUsersContainerInModal = document.getElementById("selectedUsersContainerInModal");
        this.selectAllCheckbox = document.getElementById("selectAll");
        this.userCheckboxes = document.querySelectorAll(".user-checkbox");
        this.recipientCounter = document.getElementById("recipientCounter");
        this.openRecipientModalBtn = document.getElementById("openRecipientModal");
        this.searchUsersInput = document.getElementById("searchUsers");
        this.clearRecipientsBtn = document.getElementById("clearRecipients");
        this.recipientIdsInput = document.getElementById("recipientIds");

        // Tab-specific elements
        this.roleSelect = document.getElementById("roleSelect");
        this.classSelect = document.getElementById("classSelect");
        this.classUserType = document.getElementById("classUserType");
        this.courseSelect = document.getElementById("courseSelect");

        this.userListByRole = document.getElementById("userListByRole");
        this.userListByClass = document.getElementById("userListByClass");
        this.userListByCourse = document.getElementById("userListByCourse");

        this.roleUsersDatalist = document.getElementById("roleUsersList");
        this.classUsersDatalist = document.getElementById("classUsersList");
        this.courseUsersDatalist = document.getElementById("courseUsersList");

        // Bootstrap modal
        if (typeof bootstrap !== 'undefined') {
            this.recipientModal = new bootstrap.Modal(document.getElementById('recipientModal'));
        }

        // Sets for handling user selections
        this.tempSelectedUsers = new Set();
        this.selectedUsers = new Set();

        // Bind methods to maintain 'this' context when used as callbacks
        this.removeUser = this.removeUser.bind(this);
        this.removeUserFromTemp = this.removeUserFromTemp.bind(this);
        this.filterUsers = this.filterUsers.bind(this);
        this.toggleSelectAll = this.toggleSelectAll.bind(this);
        this.fetchUsersByClass = this.fetchUsersByClass.bind(this);
    }

    init() {
        // Initialize selected users from hidden input
        const initialRecipientIds = this.recipientIdsInput.value.split(',').filter(id => id.trim() !== '');
        initialRecipientIds.forEach(id => this.selectedUsers.add(id));

        this.setupEventListeners();
        this.updateSelectedUsersDisplay();
        this.attachSearchListeners();
    }

    setupEventListeners() {
        // Open recipient modal
        this.openRecipientModalBtn.addEventListener("click", () => {
            // Copy selected users to temporary selections
            this.tempSelectedUsers.clear();
            this.selectedUsers.forEach(uid => this.tempSelectedUsers.add(uid));

            // Update checkbox states
            document.querySelectorAll(".user-checkbox").forEach(cb => {
                cb.checked = this.tempSelectedUsers.has(cb.value);
            });

            // Update the modal display
            this.updateSelectedUsersInModal();
            this.recipientModal.show();
            this.updateSelectAllCheckbox();
        });

        // Save recipients
        document.getElementById("saveRecipients").addEventListener("click", () => {
            // Clear existing selections and copy from temp
            this.selectedUsers.clear();
            this.tempSelectedUsers.forEach(uid => this.selectedUsers.add(uid));
            this.updateSelectedUsersDisplay();
        });

        // Clear all recipients
        this.clearRecipientsBtn.addEventListener("click", () => {
            this.selectedUsers.clear();
            this.tempSelectedUsers.clear();

            document.querySelectorAll(".user-checkbox").forEach(cb => {
                cb.checked = false;
            });

            this.updateSelectedUsersDisplay();
            this.updateSelectedUsersInModal();
            this.updateSelectAllCheckbox();
        });

        // User checkbox change
        this.userCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    this.tempSelectedUsers.add(checkbox.value);
                } else {
                    this.tempSelectedUsers.delete(checkbox.value);
                }
                this.updateSelectedUsersInModal();
                this.updateSelectAllCheckbox();
            });
        });

        // Select all checkbox
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener("click", this.toggleSelectAll);
        }

        // Role-based user selection
        if (this.roleSelect) {
            this.roleSelect.addEventListener("change", () => {
                const roleId = this.roleSelect.value;
                if (!roleId) return;
                this.userListByRole.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";
                fetch(`/api/v1/users/by-role/${roleId}`)
                    .then(res => res.json())
                    .then(data => this.renderUserList(data, this.userListByRole, "role"));
            });
        }

        // Class-based user selection
        if (this.classSelect && this.classUserType) {
            this.classSelect.addEventListener("change", this.fetchUsersByClass);
            this.classUserType.addEventListener("change", this.fetchUsersByClass);
        }

        // Course-based user selection
        if (this.courseSelect) {
            this.courseSelect.addEventListener("change", () => {
                const courseId = this.courseSelect.value;
                if (!courseId) return;
                this.userListByCourse.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";
                fetch(`/api/v1/users/by-course/${courseId}`)
                    .then(res => res.json())
                    .then(data => this.renderUserList(data, this.userListByCourse, "course"));
            });
        }

        // User search
        if (this.searchUsersInput) {
            this.searchUsersInput.addEventListener("input", this.filterUsers);
        }

        // Tab-based user selection
        const tabButtons = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
        tabButtons.forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                setTimeout(() => {
                    // Update checkboxes based on temporary selections
                    document.querySelectorAll(".user-checkbox").forEach(cb => {
                        cb.checked = this.tempSelectedUsers.has(cb.value);
                    });
                    // Update the modal's display of selected users
                    this.updateSelectedUsersInModal();
                }, 100);
            });
        });
    }

    attachSearchListeners() {
        // Setup role-specific select all
        document.getElementById("selectAllByRole")?.addEventListener("click", () =>
            this.toggleSelectAllGeneric("userListByRole", "selectAllByRole")
        );

        // Setup class-specific select all
        document.getElementById("selectAllByClass")?.addEventListener("click", () =>
            this.toggleSelectAllGeneric("userListByClass", "selectAllByClass")
        );

        // Setup course-specific select all
        document.getElementById("selectAllByCourse")?.addEventListener("click", () =>
            this.toggleSelectAllGeneric("userListByCourse", "selectAllByCourse")
        );

        this.attachSearch("searchUsersByRole", "userListByRole");
        this.attachSearch("searchUsersByClass", "userListByClass");
        this.attachSearch("searchUsersByCourse", "userListByCourse");
    }

    renderUserList(users, container, context) {
        container.innerHTML = "";
        if (!users || users.length === 0) {
            container.innerHTML = `<p class="text-center text-muted py-3">No users found</p>`;
            return;
        }

        // Update corresponding datalist
        let datalistElement;
        if (context === 'role') {
            datalistElement = this.roleUsersDatalist;
        } else if (context === 'class') {
            datalistElement = this.classUsersDatalist;
        } else if (context === 'course') {
            datalistElement = this.courseUsersDatalist;
        }

        if (datalistElement) {
            this.updateDatalist(users, datalistElement);
        }

        users.forEach(user => {
            const wrapper = document.createElement("div");
            wrapper.className = "user-item d-flex align-items-center border-bottom py-2 px-3";
            wrapper.innerHTML = `
                <input type="checkbox" class="form-check-input user-checkbox me-2" value="${user.id}" id="user_${context}_${user.id}">
                <label class="form-check-label text-md" for="user_${context}_${user.id}">${user.username}</label>
            `;
            wrapper.setAttribute("data-username", user.username.toLowerCase());
            container.appendChild(wrapper);

            const checkbox = wrapper.querySelector("input");
            // Check if this user is in temporary selections
            checkbox.checked = this.tempSelectedUsers.has(user.id.toString());

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    this.tempSelectedUsers.add(user.id.toString());
                } else {
                    this.tempSelectedUsers.delete(user.id.toString());
                }
                // Update the display of selected users in the modal immediately
                this.updateSelectedUsersInModal();
            });
        });
    }

    updateSelectedUsersDisplay() {
        this.selectedUsersContainer.innerHTML = "";

        if (this.selectedUsers.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted text-center my-2";
            emptyMessage.textContent = "No recipients selected";
            this.selectedUsersContainer.appendChild(emptyMessage);

            this.recipientCounter.textContent = "0 recipients selected";
        } else {
            this.selectedUsers.forEach(userId => {
                let username = this.findUsernameById(userId);
                if (username) {
                    const userBadge = document.createElement("span");
                    userBadge.className = "badge bg-primary me-1 mb-1";
                    userBadge.innerHTML = `${username} <i class="bi bi-x ms-1" style="cursor:pointer;" data-user-id="${userId}"></i>`;

                    userBadge.querySelector("i").addEventListener("click", function () {
                        const userId = this.getAttribute("data-user-id");
                        window.removeUser(userId);
                    });

                    this.selectedUsersContainer.appendChild(userBadge);
                }
            });

            this.recipientCounter.textContent = `${this.selectedUsers.size} recipients selected`;
        }

        // Update hidden input with selected user IDs
        this.recipientIdsInput.value = Array.from(this.selectedUsers).join(',');
        this.updateClearButton();
    }

    updateSelectedUsersInModal() {
        if (!this.selectedUsersContainerInModal) return;

        this.selectedUsersContainerInModal.innerHTML = "";

        if (this.tempSelectedUsers.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted text-center my-2";
            emptyMessage.textContent = "No recipients selected";
            this.selectedUsersContainerInModal.appendChild(emptyMessage);
        } else {
            this.tempSelectedUsers.forEach(userId => {
                // Find username by userId
                let username = this.findUsernameById(userId);
                if (username) {
                    // Create badge for each selected user
                    const userBadge = document.createElement("span");
                    userBadge.className = "badge bg-primary me-1 mb-1";
                    userBadge.innerHTML = `${username} <i class="bi bi-x ms-1" style="cursor:pointer;" data-user-id="${userId}"></i>`;

                    // Add click handler for the remove icon
                    userBadge.querySelector("i").addEventListener("click", function () {
                        const userId = this.getAttribute("data-user-id");
                        window.removeUserFromTemp(userId);
                    });

                    this.selectedUsersContainerInModal.appendChild(userBadge);
                }
            });
        }
    }

    findUsernameById(userId) {
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox && checkbox.nextElementSibling) {
            return checkbox.nextElementSibling.textContent;
        }
        return null;
    }

    removeUser(userId) {
        this.selectedUsers.delete(userId);
        this.tempSelectedUsers.delete(userId);

        // Update checkbox if visible
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox) checkbox.checked = false;

        // Update displays
        this.updateSelectedUsersDisplay();
        this.updateSelectedUsersInModal();
        this.updateSelectAllCheckbox();
    }

    removeUserFromTemp(userId) {
        this.tempSelectedUsers.delete(userId);

        // Update checkbox state
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox) checkbox.checked = false;

        // Update modal display
        this.updateSelectedUsersInModal();
        this.updateSelectAllCheckbox();
    }

    updateClearButton() {
        this.clearRecipientsBtn.style.display = this.selectedUsers.size > 0 ? "inline-block" : "none";
    }

    filterUsers() {
        const searchTerm = this.searchUsersInput.value.toLowerCase().trim();
        const userItems = document.querySelectorAll(".user-item");

        let hasMatches = false;
        userItems.forEach(item => {
            const label = item.querySelector("label").textContent.toLowerCase();
            const matches = label.includes(searchTerm);
            item.style.display = matches ? "" : "none";
            if (matches) hasMatches = true;
        });

        // Handle no matches message
        let noMatchesMessage = document.getElementById("noMatchesMessage");
        if (searchTerm && !hasMatches) {
            if (!noMatchesMessage) {
                noMatchesMessage = document.createElement("p");
                noMatchesMessage.id = "noMatchesMessage";
                noMatchesMessage.className = "text-center text-muted py-3";
                noMatchesMessage.textContent = "No users match your search";
                document.getElementById("userList").appendChild(noMatchesMessage);
            }
        } else if (noMatchesMessage) {
            noMatchesMessage.remove();
        }

        this.updateSelectAllCheckbox();
    }

    toggleSelectAll() {
        const visibleCheckboxes = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");

        visibleCheckboxes.forEach(checkbox => {
            checkbox.checked = this.selectAllCheckbox.checked;

            if (this.selectAllCheckbox.checked) {
                this.tempSelectedUsers.add(checkbox.value);
            } else {
                this.tempSelectedUsers.delete(checkbox.value);
            }
        });
        this.updateSelectedUsersInModal();
    }

    toggleSelectAllGeneric(listId, checkboxId) {
        const list = document.getElementById(listId);
        const masterCheckbox = document.getElementById(checkboxId);
        if (!list || !masterCheckbox) return;

        const checkboxes = list.querySelectorAll(".user-checkbox");
        checkboxes.forEach(cb => {
            cb.checked = masterCheckbox.checked;
            if (masterCheckbox.checked) {
                this.tempSelectedUsers.add(cb.value);
            } else {
                this.tempSelectedUsers.delete(cb.value);
            }
        });

        this.updateSelectedUsersInModal();
    }

    updateSelectAllCheckbox() {
        if (!this.selectAllCheckbox) return;

        let visibleUsers = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");
        let checkedCount = Array.from(visibleUsers).filter(checkbox => checkbox.checked).length;
        this.selectAllCheckbox.checked = (visibleUsers.length > 0 && checkedCount === visibleUsers.length);
        this.selectAllCheckbox.disabled = (visibleUsers.length === 0);
    }

    fetchUsersByClass() {
        const classId = this.classSelect.value;
        const type = this.classUserType.value;
        if (!classId || !type) return;

        this.userListByClass.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";

        fetch(`/api/v1/users/by-class?classId=${classId}&type=${type}`)
            .then(res => res.json())
            .then(data => this.renderUserList(data, this.userListByClass, "class"));
    }

    updateDatalist(userList, datalistElement) {
        // Clear existing options
        datalistElement.innerHTML = '';

        // Add options for all users in the list
        userList.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            datalistElement.appendChild(option);
        });
    }

    attachSearch(inputId, listId) {
        const searchInput = document.getElementById(inputId);
        const listContainer = document.getElementById(listId);

        if (!searchInput || !listContainer) return;

        searchInput.addEventListener("input", () => {
            const keyword = searchInput.value.toLowerCase().trim();
            const items = listContainer.querySelectorAll(".user-item");
            let hasMatch = false;

            items.forEach(item => {
                const username = item.dataset.username || "";
                const matched = username.includes(keyword);
                item.style.display = matched ? "" : "none";
                if (matched) hasMatch = true;
            });

            // Handle no matches message
            const noResult = listContainer.querySelector(".no-result");
            if (!hasMatch && keyword) {
                if (!noResult) {
                    const p = document.createElement("p");
                    p.className = "no-result text-center text-muted py-3";
                    p.textContent = "No users match your search";
                    listContainer.appendChild(p);
                }
            } else {
                if (noResult) noResult.remove();
            }
        });
    }
}