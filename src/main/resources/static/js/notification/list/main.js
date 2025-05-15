document.addEventListener('DOMContentLoaded', () => {
    setupEventHandlers();

    function setupEventHandlers() {
        const searchForm = document.querySelector('form[action="/notifications"]');
        const filterSelect = document.querySelector('select[name="typeName"]');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const applyDateFilterBtn = document.getElementById('applyDateFilter');

        searchModule.setupSearchForm(searchForm, filterSelect);
        filterModule.setupDateFilter(startDateInput, endDateInput, applyDateFilterBtn);
        filterModule.setupResetButton();
        paginationModule.setupPagination();
        checkboxModule.setupCheckboxesAndDelete();

        dataModule.fetchNotifications('/notifications/get');
    }
});