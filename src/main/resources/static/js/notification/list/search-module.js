const searchModule = {
    setupSearchForm: function(searchForm, filterSelect) {
        if (searchForm) {
            const searchInput = document.querySelector('input[name="searchTerm"]');
            if (searchInput) {
                searchInput.addEventListener('keypress', function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        this.triggerSearch(searchInput, filterSelect);
                    }
                }.bind(this));
            }

            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.triggerSearch(
                    searchForm.querySelector('input[name="searchTerm"]'),
                    searchForm.querySelector('input[name="typeName"]')
                );
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.triggerSearch(
                    document.querySelector('input[name="searchTerm"]'),
                    filterSelect
                );
            });
        }
    },

    triggerSearch: function(searchInput, typeInput) {
        const searchTerm = searchInput ? searchInput.value : '';
        const typeName = typeInput ? typeInput.value : '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';

        dataModule.fetchNotifications('/notifications/get', {searchTerm, typeName, startDate, endDate});
    }
};