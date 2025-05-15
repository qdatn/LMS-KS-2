document.addEventListener("DOMContentLoaded", function () {
    // Form elements
    const notificationForm = document.getElementById("notificationForm");
    const typeSelect = document.getElementById("type");
    const messageInput = document.getElementById("message");
    const objectIdInput = document.getElementById("objectId");
    const selectedObjectIdInput = document.getElementById("selectedObjectId");
    const recipientIdsInput = document.getElementById("recipientIds");

    // Object selection elements
    const openObjectModalBtn = document.getElementById("openObjectModal");
    const saveObjectBtn = document.getElementById("saveObject");
    const objectList = document.getElementById("objectList");
    const searchObjectsInput = document.getElementById("searchObjects");
    const noObjectsMessage = document.getElementById("noObjectsMessage");

    // Recipient selection elements
    const selectedUsersContainer = document.getElementById("selectedUsersContainer");
    const selectedUsersContainerInModal = document.getElementById("selectedUsersContainerInModal");
    const selectAllCheckbox = document.getElementById("selectAll");
    const userCheckboxes = document.querySelectorAll(".user-checkbox");
    const recipientCounter = document.getElementById("recipientCounter");
    const openRecipientModalBtn = document.getElementById("openRecipientModal");
    const searchUsersInput = document.getElementById("searchUsers");
    const clearRecipientsBtn = document.getElementById("clearRecipients");

    // Tab-specific elements
    const roleSelect = document.getElementById("roleSelect");
    const classSelect = document.getElementById("classSelect");
    const classUserType = document.getElementById("classUserType");
    const courseSelect = document.getElementById("courseSelect");

    const userListByRole = document.getElementById("userListByRole");
    const userListByClass = document.getElementById("userListByClass");
    const userListByCourse = document.getElementById("userListByCourse");

    const objectsDatalist = document.getElementById("objectsList");
    const roleUsersDatalist = document.getElementById("roleUsersList");
    const classUsersDatalist = document.getElementById("classUsersList");
    const courseUsersDatalist = document.getElementById("courseUsersList");

    // Bootstrap modals
    let objectModal;
    let recipientModal;
    if (typeof bootstrap !== 'undefined') {
        objectModal = new bootstrap.Modal(document.getElementById('objectModal'));
        recipientModal = new bootstrap.Modal(document.getElementById('recipientModal'));
    }

    // Store objects list for each type
    const objectTypeMapping = {};

    // Sets for handling user selections
    const tempSelectedUsers = new Set();
    const selectedUsers = new Set();

    // Initialize selected users from hidden input
    const initialRecipientIds = recipientIdsInput.value.split(',').filter(id => id.trim() !== '');
    initialRecipientIds.forEach(id => selectedUsers.add(id));

    // ---------------------------
    // Utility Functions
    // ---------------------------

    // Function to update datalist for search
    function updateDatalist(userList, datalistElement) {
        // Clear existing options
        datalistElement.innerHTML = '';

        // Add options for all users in the list
        userList.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            datalistElement.appendChild(option);
        });
    }

    function attachSearch(inputId, listId) {
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

    function showNotification(type, message) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} d-flex align-items-center`;
        alertDiv.setAttribute('role', 'alert');

        const icon = type === 'error' ? 'exclamation-triangle' : 'check-circle';
        alertDiv.innerHTML = `<i class="bi bi-${icon} me-2"></i><span>${message}</span>`;

        notificationForm.parentNode.insertBefore(alertDiv, notificationForm);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    function initializeObjectSelection() {
        const selectedType = typeSelect.value;
        openObjectModalBtn.disabled = !selectedType;

        if (selectedType) {
            const selectedOption = typeSelect.options[typeSelect.selectedIndex];
            const selectedTypeUrl = selectedOption.dataset.url;

            if (selectedTypeUrl) {
                openObjectModalBtn.dataset.typeUrl = selectedTypeUrl;
            }
        }
    }

    function fetchObjectsByType(typeUrl) {
        objectList.innerHTML = "";
        const loadingMessage = document.createElement("p");
        loadingMessage.id = "loadingMessage";
        loadingMessage.className = "text-center text-muted py-3";
        loadingMessage.innerHTML = "Loading objects...";
        objectList.appendChild(loadingMessage);
        saveObjectBtn.disabled = true;

        // Check if we've already cached these objects
        if (objectTypeMapping[typeUrl]) {
            populateObjects(objectTypeMapping[typeUrl]);
            return;
        }

        fetch(`/api/v1/notifications/get-object-type`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ typeUrl })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                // Check if content type is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return response.json();
                } else {
                    throw new Error("Server returned non-JSON response. Please check API endpoint.");
                }
            })
            .then(objects => {
                // Cache the objects for this type
                objectTypeMapping[typeUrl] = objects;
                populateObjects(objects);
            })
            .catch(error => {
                console.error("Error fetching objects:", error);
                objectList.innerHTML = "";
                const errorMessage = document.createElement("p");
                errorMessage.className = "text-center text-danger py-3";
                errorMessage.innerHTML = `Error loading objects: ${error.message}`;
                objectList.appendChild(errorMessage);
            });
    }

    function populateObjects(objects) {
        objectList.innerHTML = "";

        // Also populate datalist for search
        if (objectsDatalist) {
            objectsDatalist.innerHTML = "";
        }

        if (!objects || objects.length === 0) {
            const noObjectsElement = document.createElement("p");
            noObjectsElement.className = "text-center text-muted py-3";
            noObjectsElement.innerHTML = "No objects found for this type";
            objectList.appendChild(noObjectsElement);
            saveObjectBtn.disabled = true;
            return;
        }

        // Check if current objectId matches any of the objects
        const currentObjectId = selectedObjectIdInput.value;
        let found = false;

        objects.forEach(obj => {
            // Add to datalist if it exists
            if (objectsDatalist) {
                const option = document.createElement('option');
                option.value = obj.name;
                objectsDatalist.appendChild(option);
            }

            const objectItem = document.createElement("div");
            objectItem.classList.add("object-item", "py-2", "px-3", "border-bottom", "d-flex", "align-items-center");

            // Check if this is the currently selected object
            const isSelected = obj.id.toString() === currentObjectId;
            if (isSelected) {
                found = true;
                objectItem.classList.add("bg-light");
                // Update the object name in the input field if it's not already set correctly
                if (objectIdInput.value !== obj.name) {
                    objectIdInput.value = obj.name;
                }
            }

            objectItem.innerHTML = `
                <input type="radio" name="selectedObject" class="form-check-input object-radio me-2"
                       value="${obj.id}" id="object_${obj.id}" ${isSelected ? 'checked' : ''}>
                <label class="form-check-label text-md" for="object_${obj.id}">${obj.name}</label>
            `;
            objectList.appendChild(objectItem);
        });

        const objectRadios = document.querySelectorAll(".object-radio");
        objectRadios.forEach(radio => {
            radio.addEventListener("change", function () {
                saveObjectBtn.disabled = !this.checked;

                // Update highlighting
                document.querySelectorAll(".object-item").forEach(item => {
                    item.classList.remove("bg-light");
                });
                if (this.checked) {
                    this.closest(".object-item").classList.add("bg-light");
                }
            });
        });

        // Enable save button if any object is pre-selected
        saveObjectBtn.disabled = !found;
    }

    // ---------------------------
    // Recipient Selection Functions
    // ---------------------------

    function renderUserList(users, container, context) {
        container.innerHTML = "";
        if (!users || users.length === 0) {
            container.innerHTML = `<p class="text-center text-muted py-3">No users found</p>`;
            return;
        }

        // Update corresponding datalist
        let datalistElement;
        if (context === 'role') {
            datalistElement = roleUsersDatalist;
        } else if (context === 'class') {
            datalistElement = classUsersDatalist;
        } else if (context === 'course') {
            datalistElement = courseUsersDatalist;
        }

        if (datalistElement) {
            updateDatalist(users, datalistElement);
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
            checkbox.checked = tempSelectedUsers.has(user.id.toString());

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    tempSelectedUsers.add(user.id.toString());
                } else {
                    tempSelectedUsers.delete(user.id.toString());
                }
                // Update the display of selected users in the modal immediately
                updateSelectedUsersInModal();
            });
        });
    }

    function updateSelectedUsersDisplay() {
        selectedUsersContainer.innerHTML = "";

        if (selectedUsers.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted text-center my-2";
            emptyMessage.textContent = "No recipients selected";
            selectedUsersContainer.appendChild(emptyMessage);

            recipientCounter.textContent = "0 recipients selected";
        } else {
            selectedUsers.forEach(userId => {
                let username = findUsernameById(userId);
                if (username) {
                    const userBadge = document.createElement("span");
                    userBadge.className = "badge bg-primary me-1 mb-1";
                    userBadge.innerHTML = `${username} <i class="bi bi-x ms-1" style="cursor:pointer;" data-user-id="${userId}"></i>`;

                    userBadge.querySelector("i").addEventListener("click", function () {
                        const userId = this.getAttribute("data-user-id");
                        removeUser(userId);
                    });

                    selectedUsersContainer.appendChild(userBadge);
                }
            });

            recipientCounter.textContent = `${selectedUsers.size} recipients selected`;
        }

        // Update hidden input with selected user IDs
        recipientIdsInput.value = Array.from(selectedUsers).join(',');
        updateClearButton();
    }

    function updateSelectedUsersInModal() {
        if (!selectedUsersContainerInModal) return;

        selectedUsersContainerInModal.innerHTML = "";

        if (tempSelectedUsers.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "text-muted text-center my-2";
            emptyMessage.textContent = "No recipients selected";
            selectedUsersContainerInModal.appendChild(emptyMessage);
        } else {
            tempSelectedUsers.forEach(userId => {
                // Find username by userId
                let username = findUsernameById(userId);
                if (username) {
                    // Create badge for each selected user
                    const userBadge = document.createElement("span");
                    userBadge.className = "badge bg-primary me-1 mb-1";
                    userBadge.innerHTML = `${username} <i class="bi bi-x ms-1" style="cursor:pointer;" data-user-id="${userId}"></i>`;

                    // Add click handler for the remove icon
                    userBadge.querySelector("i").addEventListener("click", function () {
                        const userId = this.getAttribute("data-user-id");
                        removeUserFromTemp(userId);
                    });

                    selectedUsersContainerInModal.appendChild(userBadge);
                }
            });
        }
    }

    function findUsernameById(userId) {
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox && checkbox.nextElementSibling) {
            return checkbox.nextElementSibling.textContent;
        }
        return null;
    }

    function removeUser(userId) {
        selectedUsers.delete(userId);
        tempSelectedUsers.delete(userId);

        // Update checkbox if visible
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox) checkbox.checked = false;

        // Update displays
        updateSelectedUsersDisplay();
        updateSelectedUsersInModal();
        updateSelectAllCheckbox();
    }

    function removeUserFromTemp(userId) {
        tempSelectedUsers.delete(userId);

        // Update checkbox state
        const checkbox = document.querySelector(`.user-checkbox[value="${userId}"]`);
        if (checkbox) checkbox.checked = false;

        // Update modal display
        updateSelectedUsersInModal();
        updateSelectAllCheckbox();
    }

    function updateClearButton() {
        clearRecipientsBtn.style.display = selectedUsers.size > 0 ? "inline-block" : "none";
    }

    function filterUsers() {
        const searchTerm = searchUsersInput.value.toLowerCase().trim();
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

        updateSelectAllCheckbox();
    }

    function toggleSelectAll() {
        const visibleCheckboxes = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");

        visibleCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;

            if (selectAllCheckbox.checked) {
                tempSelectedUsers.add(checkbox.value);
            } else {
                tempSelectedUsers.delete(checkbox.value);
            }
        });
        updateSelectedUsersInModal();
    }

    function toggleSelectAllGeneric(listId, checkboxId) {
        const list = document.getElementById(listId);
        const masterCheckbox = document.getElementById(checkboxId);
        if (!list || !masterCheckbox) return;

        const checkboxes = list.querySelectorAll(".user-checkbox");
        checkboxes.forEach(cb => {
            cb.checked = masterCheckbox.checked;
            if (masterCheckbox.checked) {
                tempSelectedUsers.add(cb.value);
            } else {
                tempSelectedUsers.delete(cb.value);
            }
        });

        updateSelectedUsersInModal();
    }

    function updateSelectAllCheckbox() {
        if (!selectAllCheckbox) return;

        let visibleUsers = document.querySelectorAll(".user-item:not([style*='display: none']) .user-checkbox");
        let checkedCount = Array.from(visibleUsers).filter(checkbox => checkbox.checked).length;
        selectAllCheckbox.checked = (visibleUsers.length > 0 && checkedCount === visibleUsers.length);
        selectAllCheckbox.disabled = (visibleUsers.length === 0);
    }

    function validateForm() {
        let isValid = true;
        let errorMessage = "";

        if (!typeSelect.value) {
            errorMessage = "Please select a notification type";
            isValid = false;
        } else if (!messageInput.value.trim()) {
            errorMessage = "Please enter a notification message";
            isValid = false;
        } else if (selectedUsers.size === 0) {
            errorMessage = "Please select at least one recipient";
            isValid = false;
        }

        if (!isValid) {
            showNotification('error', errorMessage);
        }

        return isValid;
    }

    // ---------------------------
    // Event Listeners
    // ---------------------------

    // Type select change
    typeSelect.addEventListener("change", function () {
        const selectedType = this.value;
        openObjectModalBtn.disabled = !selectedType;

        objectIdInput.value = "";
        selectedObjectIdInput.value = "";

        if (selectedType) {
            // Get the selected option and its URL data attribute
            const selectedOption = typeSelect.options[typeSelect.selectedIndex];
            const selectedTypeUrl = selectedOption.dataset.url;

            if (selectedTypeUrl) {
                openObjectModalBtn.dataset.typeUrl = selectedTypeUrl;
                console.log("Selected type URL:", selectedTypeUrl);
            } else {
                console.warn("Selected type doesn't have a URL property");
            }
        }
    });

    // Open object modal
    openObjectModalBtn.addEventListener("click", function () {
        const typeUrl = this.dataset.typeUrl;
        if (typeUrl) {
            fetchObjectsByType(typeUrl);
        }
        if (objectModal) {
            objectModal.show();

            // Once modal is shown, scroll to the selected item if any
            objectModal._element.addEventListener('shown.bs.modal', function () {
                const selectedRadio = document.querySelector('input[name="selectedObject"]:checked');
                if (selectedRadio) {
                    selectedRadio.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, { once: true });
        }
    });

    // Save selected object
    saveObjectBtn.addEventListener("click", function () {
        const selectedRadio = document.querySelector('input[name="selectedObject"]:checked');
        if (selectedRadio) {
            const selectedObjectId = selectedRadio.value;
            const selectedObjectName = selectedRadio.nextElementSibling.textContent;

            objectIdInput.value = selectedObjectName;
            selectedObjectIdInput.value = selectedObjectId;
        }
    });

    // Object search
    searchObjectsInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase().trim();
        const objectItems = document.querySelectorAll(".object-item");

        let hasMatches = false;
        objectItems.forEach(item => {
            const label = item.querySelector("label").textContent.toLowerCase();
            const matches = label.includes(searchTerm);
            item.style.display = matches ? "" : "none";
            if (matches) hasMatches = true;
        });

        if (searchTerm && !hasMatches) {
            objectList.querySelectorAll("p.text-center").forEach(el => el.remove());
            const noMatchesMessage = document.createElement("p");
            noMatchesMessage.className = "text-center text-muted py-3";
            noMatchesMessage.innerHTML = "No objects match your search";
            objectList.appendChild(noMatchesMessage);
        }
    });

    // Open recipient modal
    openRecipientModalBtn.addEventListener("click", function () {
        // Copy selected users to temporary selections
        tempSelectedUsers.clear();
        selectedUsers.forEach(uid => tempSelectedUsers.add(uid));

        // Update checkbox states
        document.querySelectorAll(".user-checkbox").forEach(cb => {
            cb.checked = tempSelectedUsers.has(cb.value);
        });

        // Update the modal display
        updateSelectedUsersInModal();
        recipientModal.show();
        updateSelectAllCheckbox();
    });

    // Save recipients
    document.getElementById("saveRecipients").addEventListener("click", function () {
        // Clear existing selections and copy from temp
        selectedUsers.clear();
        tempSelectedUsers.forEach(uid => selectedUsers.add(uid));
        updateSelectedUsersDisplay();
    });

    // Clear all recipients
    clearRecipientsBtn.addEventListener("click", function () {
        selectedUsers.clear();
        tempSelectedUsers.clear();

        document.querySelectorAll(".user-checkbox").forEach(cb => {
            cb.checked = false;
        });

        updateSelectedUsersDisplay();
        updateSelectedUsersInModal();
        updateSelectAllCheckbox();
    });

    // User checkbox change
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                tempSelectedUsers.add(this.value);
            } else {
                tempSelectedUsers.delete(this.value);
            }
            updateSelectedUsersInModal();
            updateSelectAllCheckbox();
        });
    });

    // Select all checkbox handlers
    selectAllCheckbox?.addEventListener("click", toggleSelectAll);
    document.getElementById("selectAllByRole")?.addEventListener("click", () =>
        toggleSelectAllGeneric("userListByRole", "selectAllByRole")
    );
    document.getElementById("selectAllByClass")?.addEventListener("click", () =>
        toggleSelectAllGeneric("userListByClass", "selectAllByClass")
    );
    document.getElementById("selectAllByCourse")?.addEventListener("click", () =>
        toggleSelectAllGeneric("userListByCourse", "selectAllByCourse")
    );

    // User search
    searchUsersInput.addEventListener("input", filterUsers);
    attachSearch("searchUsersByRole", "userListByRole");
    attachSearch("searchUsersByClass", "userListByClass");
    attachSearch("searchUsersByCourse", "userListByCourse");

    // Tab-based user selection
    const tabButtons = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
    tabButtons.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function () {
            setTimeout(() => {
                // Update checkboxes based on temporary selections
                document.querySelectorAll(".user-checkbox").forEach(cb => {
                    cb.checked = tempSelectedUsers.has(cb.value);
                });
                // Update the modal's display of selected users
                updateSelectedUsersInModal();
            }, 100);
        });
    });

    // Role selection
    roleSelect?.addEventListener("change", function () {
        const roleId = this.value;
        if (!roleId) return;
        userListByRole.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";
        fetch(`/api/v1/users/by-role/${roleId}`)
            .then(res => res.json())
            .then(data => renderUserList(data, userListByRole, "role"));
    });

    // Class selection
    classSelect?.addEventListener("change", fetchUsersByClass);
    classUserType?.addEventListener("change", fetchUsersByClass);

    function fetchUsersByClass() {
        const classId = classSelect.value;
        const type = classUserType.value;
        if (!classId || !type) return;

        userListByClass.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";

        fetch(`/api/v1/users/by-class?classId=${classId}&type=${type}`)
            .then(res => res.json())
            .then(data => renderUserList(data, userListByClass, "class"));
    }

    // Course selection
    courseSelect?.addEventListener("change", function () {
        const courseId = this.value;
        if (!courseId) return;
        userListByCourse.innerHTML = "<p class='text-center text-muted py-3'>Loading...</p>";
        fetch(`/api/v1/users/by-course/${courseId}`)
            .then(res => res.json())
            .then(data => renderUserList(data, userListByCourse, "course"));
    });

    notificationForm.addEventListener("submit", function(e) {
        // Basic validation
        if (!typeSelect.value) {
            e.preventDefault();
            alert("Please select a notification type");
            return false;
        }

        if (!messageInput.value.trim()) {
            e.preventDefault();
            alert("Please enter a notification message");
            return false;
        }

        if (selectedUsers.size === 0) {
            e.preventDefault();
            alert("Please select at least one recipient");
            return false;
        }

        // Update recipients input before submit
        recipientIdsInput.value = Array.from(selectedUsers).join(',');

        return true;
    });

    // Make functions available to global scope for HTML handlers
    window.removeUser = removeUser;
    window.removeUserFromTemp = removeUserFromTemp;
    window.filterUsers = filterUsers;

    // Initialize the page
    initializeObjectSelection();
    updateSelectedUsersDisplay();

    // Load object details if we have a type and object ID
    if (selectedObjectIdInput.value && typeSelect.value) {
        const selectedOption = typeSelect.options[typeSelect.selectedIndex];
        const selectedTypeUrl = selectedOption.dataset.url;

        if (selectedTypeUrl) {
            fetch(`/api/v1/notifications/get-object-type`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ typeUrl: selectedTypeUrl })
            })
                .then(response => response.json())
                .then(objects => {
                    objectTypeMapping[selectedTypeUrl] = objects;

                    // Find the matching object and update the name
                    const selectedId = selectedObjectIdInput.value;
                    const matchedObject = objects.find(obj => obj.id.toString() === selectedId);

                    if (matchedObject) {
                        objectIdInput.value = matchedObject.name;
                    }
                })
                .catch(error => {
                    console.error("Error fetching objects for initial load:", error);
                });
        }
    }
});