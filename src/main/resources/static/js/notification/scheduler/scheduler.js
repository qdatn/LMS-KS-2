/**
 * ObjectManager and RecipientManager initialization script
 */

document.addEventListener("DOMContentLoaded", function () {
    // Create manager instances
    const objectManager = new ObjectManager();
    const recipientManager = new RecipientManager();

    // Initialize managers
    objectManager.init();
    recipientManager.init();

    // Setup type selection to work with object manager
    const typeSelect = document.getElementById("typeSelect");
    const openObjectModalBtn = document.getElementById("openObjectModal");

    typeSelect.addEventListener("change", function() {
        const selectedOption = this.options[this.selectedIndex];
        openObjectModalBtn.disabled = !this.value;

        // Reset object selection when type changes
        document.getElementById("objectId").value = "";
        document.getElementById("selectedObjectId").value = "";

        // Get the URL from data attribute if available
        if (selectedOption && selectedOption.dataset.url) {
            const typeUrl = selectedOption.dataset.url;
            console.log("Type changed, URL:", typeUrl);
            objectManager.fetchObjectsByType(typeUrl);
        }
    });

    openObjectModalBtn.addEventListener("click", function() {
        // This gets the currently selected type's URL and fetches objects
        const selectedOption = typeSelect.options[typeSelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.url) {
            objectManager.fetchObjectsByType(selectedOption.dataset.url);
        }
        if (objectManager.objectModal) {
            objectManager.objectModal.show();
        }
    });

    // Add the window global functions needed for the recipient manager
    window.removeUser = recipientManager.removeUser;
    window.removeUserFromTemp = recipientManager.removeUserFromTemp;
    window.filterUsers = recipientManager.filterUsers;
    window.toggleSelectAll = recipientManager.toggleSelectAll;

    // Setup delay time calculation
    const delayInput = document.getElementById('delayValue');
    const delayUnit = document.getElementById('delayUnit');
    const totalDelayInput = document.getElementById('totalDelayInHours');
    const increaseBtn = document.getElementById('increaseDelayBtn');
    const decreaseBtn = document.getElementById('decreaseDelayBtn');

    // Function to calculate and update total delay in hours
    function updateTotalDelay() {
        let value = parseInt(delayInput.value) || 1;
        let unit = delayUnit.value;

        // Validate input
        value = Math.max(1, Math.min(value, 30));
        delayInput.value = value;

        // Calculate total hours
        let totalHours = unit === 'days' ? value * 24 : value;
        totalDelayInput.value = totalHours;

        // Update hidden input for form submission
        return totalHours;
    }

    // Increase button event
    increaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(delayInput.value) || 1;
        delayInput.value = Math.min(currentValue + 1, 30);
        updateTotalDelay();
    });

    // Decrease button event
    decreaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(delayInput.value) || 1;
        delayInput.value = Math.max(currentValue - 1, 1);
        updateTotalDelay();
    });

    // Unit change event
    delayUnit.addEventListener('change', updateTotalDelay);

    // Manual input events
    delayInput.addEventListener('change', updateTotalDelay);
    delayInput.addEventListener('input', updateTotalDelay);

    // Initial calculation
    updateTotalDelay();
});