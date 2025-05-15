// File for JS logic of create user page
// Handles AJAX form submission and error/success display

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
    const form = document.getElementById('userCreateForm');
    const errorDiv = document.getElementById('userCreateError');
    const successDiv = document.getElementById('userCreateSuccess');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                console.log(value, key);
                if (key === 'roles') {
                    if (!data[key]) {
                        data[key] = [];
                    }
                    data[key].push({ id: Number(value) });
                } else {
                    data[key] = value;
                }
            });

            fetch('/api/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json().then(json => ({status: response.status, body: json})))
            .then(({status, body}) => {
                if (status >= 200 && status < 300) {
                    successDiv.innerText = 'User created successfully!';
                    successDiv.style.display = 'block';
                    form.reset();
                } else {
                    errorDiv.innerText = body.error || 'Failed to create user.';
                    errorDiv.style.display = 'block';
                }
            })
            .catch(error => {
                errorDiv.innerText = 'An error occurred: ' + error;
                errorDiv.style.display = 'block';
            });
        });
    }
});
