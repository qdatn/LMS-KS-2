function toggleSelectAll() {
    let selectAllCheckbox = document.getElementById('selectAllRoles');
    let checkboxes = document.querySelectorAll('.role-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function filterRoles() {
    let searchInput = document.getElementById('roleSearch').value.toLowerCase();
    let roleItems = document.querySelectorAll('.role-item');
    roleItems.forEach(item => {
        let roleName = item.querySelector('label').textContent.toLowerCase();
        if (roleName.includes(searchInput)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Hiển thị thông báo lỗi
function showUserUpdateError(message) {
    const errorDiv = document.getElementById('userUpdateError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }
}

// Hiển thị thông báo thành công
function showUserUpdateSuccess(message) {
    const successDiv = document.getElementById('userUpdateSuccess');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('d-none');
    }
}

// Ẩn thông báo
function hideUserUpdateMessages() {
    const errorDiv = document.getElementById('userUpdateError');
    const successDiv = document.getElementById('userUpdateSuccess');
    if (errorDiv) errorDiv.classList.add('d-none');
    if (successDiv) successDiv.classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', function () {
    // Form validation
    (function() {
        'use strict';
        window.addEventListener('load', function() {
            var forms = document.getElementsByClassName('needs-validation');
            var validation = Array.prototype.filter.call(forms, function(form) {
                form.addEventListener('submit', function(event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
            // Initialize the select all checkbox based on current selection
            var roleCheckboxes = document.querySelectorAll('.role-checkbox');
            var allChecked = true;
            roleCheckboxes.forEach(function(checkbox) {
                if (!checkbox.checked) {
                    allChecked = false;
                }
            });
            var selectAll = document.getElementById('selectAllRoles');
            if (selectAll) selectAll.checked = allChecked;
        }, false);
    })();

    // AJAX form submit
    const form = document.getElementById('userUpdateForm');
    const errorDiv = document.getElementById('userUpdateError');
    const successDiv = document.getElementById('userUpdateSuccess');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // const formData = new FormData(form);
            formData = {
                id: form.id.value,
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.email.value,
                username: form.username.value,
                password: form.password.value,
                roles: Array.from(document.querySelectorAll('.role-checkbox')).filter(checkbox => checkbox.checked).map(checkbox => ({id: Number(checkbox.value), name: checkbox.name, modules: []})),
                is2faEnabled: form.is2faEnabled.checked,
                isLocked: form.isLocked.checked
            };


            const id = form.id.value;
            fetch(`/api/v1/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json().then(json => ({status: response.status, body: json})))
            .then(({status, body}) => {
                if (status >= 200 && status < 300) {
                    showUserUpdateSuccess('User updated successfully!');
                } else {
                    showUserUpdateError(body.error || 'Failed to update user.');
                }
            })
            .catch(error => {
                showUserUpdateError('An error occurred: ' + error);
            });
        });
    }
});
