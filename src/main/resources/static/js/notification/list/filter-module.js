const filterModule = {
    setupDateFilter: function(startDateInput, endDateInput) {
        if (startDateInput) {
            startDateInput.addEventListener('change', () => this.triggerDateFilter(startDateInput, endDateInput));
        }

        if (endDateInput) {
            endDateInput.addEventListener('change', () => this.triggerDateFilter(startDateInput, endDateInput));
        }
    },

    triggerDateFilter: function(startDateInput, endDateInput) {
        const startDate = startDateInput?.value || '';
        const endDate = endDateInput?.value || '';
        const searchTerm = document.querySelector('input[name="searchTerm"]')?.value || '';
        const typeName = document.querySelector('select[name="typeName"]')?.value || '';

        dataModule.fetchNotifications('/notifications/get', {searchTerm, typeName, startDate, endDate});
    },

    setupResetButton: function() {
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                // Clear search inputs
                const searchInput = document.querySelector('input[name="searchTerm"]');
                if (searchInput) searchInput.value = '';

                // Clear filter select
                const filterSelect = document.querySelector('select[name="typeName"]');
                if (filterSelect) filterSelect.value = '';

                // Clear date inputs
                const startDateInput = document.getElementById('startDate');
                const endDateInput = document.getElementById('endDate');
                if (startDateInput) startDateInput.value = '';
                if (endDateInput) endDateInput.value = '';

                // Fetch all notifications
                dataModule.fetchNotifications('/notifications/get');
            });
        }
    }
};