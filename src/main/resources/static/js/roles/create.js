
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

    // AJAX form submit
    const form = document.getElementById('roleCreateForm');
    const errorDiv = document.getElementById('roleCreateError');
    const successDiv = document.getElementById('roleCreateSuccess');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (errorDiv) errorDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'none';

            const data = {
                name: document.getElementById('name').value,
            };

            fetch('/api/v1/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    if (successDiv) {
                        successDiv.textContent = 'Role created successfully!';
                        successDiv.style.display = 'block';
                        setTimeout(() => {
                            successDiv.style.display = 'none';
                        }, 5000);
                    }
                    form.reset();
                    form.classList.remove('was-validated');
                } else {
                    return response.json().then(data => {
                        if (errorDiv) {
                            errorDiv.textContent = data.message || 'Failed to create role';
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
