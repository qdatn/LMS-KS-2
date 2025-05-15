const paginationModule = {
    setupPagination: function() {
        const paginationLinks = document.querySelectorAll('#pagination .page-link');
        paginationLinks.forEach(link => {
            if (!link.hasAttribute('data-page')) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                const searchTerm = document.querySelector('input[name="searchTerm"]')?.value || '';
                const typeName = document.querySelector('select[name="typeName"]')?.value || '';
                const startDate = document.getElementById('startDate')?.value || '';
                const endDate = document.getElementById('endDate')?.value || '';

                dataModule.fetchNotifications('/notifications/get', {
                    page, searchTerm, typeName, startDate, endDate
                });
            });
        });
    }
};