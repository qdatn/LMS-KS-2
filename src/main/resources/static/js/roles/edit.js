
document.addEventListener('DOMContentLoaded', function () {
    // Form validation
    (function() {
        'use strict';
        window.addEventListener('load', function() {
            var forms = document.getElementsByClassName('needs-validation');
            Array.prototype.forEach.call(forms, function(form) {
                form.addEventListener('submit', function(event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    })();

    const form = document.getElementById('editRoleForm');
    const errorDiv = document.getElementById('roleEditError');
    const successDiv = document.getElementById('roleEditSuccess');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (errorDiv) errorDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'none';

            const roleId = document.getElementById('roleId').value;
            const data = {
                name: document.getElementById('name').value,
            };

            fetch('/api/v1/roles/' + roleId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    if (successDiv) {
                        successDiv.textContent = 'Role updated successfully!';
                        successDiv.style.display = 'block';
                        setTimeout(() => {
                            successDiv.style.display = 'none';
                        }, 5000);
                    }
                } else {
                    return response.json().then(data => {
                        if (errorDiv) {
                            errorDiv.textContent = data.message || 'Failed to update role';
                            errorDiv.style.display = 'block';
                            setTimeout(() => {
                                errorDiv.style.display = 'none';
                            }, 5000);
                        }
                    });
                }
            })
            .catch(error => {
                if (errorDiv) {
                    errorDiv.textContent = error.message;
                    errorDiv.style.display = 'block';
                    setTimeout(() => {
                        errorDiv.style.display = 'none';
                    }, 5000);
                }
            });
        });
    }
});
