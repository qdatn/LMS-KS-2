const dataModule = {
    fetchNotifications: function(url, params = {}) {
        console.log(url + '?' + new URLSearchParams(params).toString());

        fetch(url + '?' + new URLSearchParams(params), {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                const notificationContainer = document.getElementById('notificationTableContainer');
                if (notificationContainer) {
                    notificationContainer.innerHTML = html;

                    if (!notificationContainer) {
                        location.href = url + '?' + new URLSearchParams(params);
                        return;
                    }

                    const selectAllCheckbox = document.getElementById('selectAll');
                    if (selectAllCheckbox) selectAllCheckbox.checked = false;

                    paginationModule.setupPagination();
                    checkboxModule.setupCheckboxesAndDelete();
                }
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
                alert('Failed to load notifications. Please try again later.');
            });
    }
};