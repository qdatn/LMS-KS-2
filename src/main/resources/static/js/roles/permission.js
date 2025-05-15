// Function to update selected modules hidden input
function updateSelectedModules() {
    const assignedModules = document.querySelectorAll('#assignedContainer .module-item');
    
    // Clear previous inputs
    const container = document.getElementById('moduleInputsContainer');
    container.innerHTML = '';
    
    // Create new inputs for each module
    assignedModules.forEach((item, index) => {
        const moduleId = item.getAttribute('data-module-id');
        const moduleName = item.querySelector('.module-name').textContent;
        
        // Create input for module id
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = `modules[${index}].id`;
        inputId.value = moduleId;
        container.appendChild(inputId);
        
        // Create input for module name
        const inputName = document.createElement('input');
        inputName.type = 'hidden';
        inputName.name = `modules[${index}].name`;
        inputName.value = moduleName;
        container.appendChild(inputName);
    });
}

// Function to add module to role
function addModule(element) {
    const moduleId = element.getAttribute('data-module-id');
    const moduleName = element.querySelector('.module-name').textContent;
    
    // Create new element in assigned list
    const newAssigned = document.createElement('div');
    newAssigned.className = 'module-item p-2 mb-1 rounded-2 bg-white shadow-sm d-flex justify-content-between align-items-center';
    newAssigned.setAttribute('data-module-id', moduleId);
    newAssigned.onclick = function() { removeModule(this); };
    newAssigned.innerHTML = `
        <div>
            <span class="module-name">${moduleName}</span>
        </div>
        <i class="bi bi-arrow-right text-danger"></i>
    `;
    
    // Add to assigned list and remove from available list
    document.getElementById('assignedContainer').appendChild(newAssigned);
    element.remove();
    
    // Update hidden inputs with selected modules
    updateSelectedModules();
    
    // Refresh search results
    filterModules('searchAssigned', 'assignedContainer', 'noResultsAssigned');
    filterModules('searchAvailable', 'availableContainer', 'noResultsAvailable');
}

// Function to remove module from role
function removeModule(element) {
    const moduleId = element.getAttribute('data-module-id');
    const moduleName = element.querySelector('.module-name').textContent;
    
    // Create new element in available list
    const newAvailable = document.createElement('div');
    newAvailable.className = 'module-item p-2 mb-1 rounded-2 bg-white shadow-sm d-flex justify-content-between align-items-center';
    newAvailable.setAttribute('data-module-id', moduleId);
    newAvailable.onclick = function() { addModule(this); };
    newAvailable.innerHTML = `
        <i class="bi bi-arrow-left text-success"></i>
        <div>
            <span class="module-name">${moduleName}</span>
        </div>
    `;
    
    // Add to available list and remove from assigned list
    document.getElementById('availableContainer').appendChild(newAvailable);
    element.remove();
    
    // Update hidden inputs with selected modules
    updateSelectedModules();
    
    // Refresh search results
    filterModules('searchAssigned', 'assignedContainer', 'noResultsAssigned');
    filterModules('searchAvailable', 'availableContainer', 'noResultsAvailable');
}

// Function to filter modules with improved search
function filterModules(inputId, containerId, noResultsId) {
    const searchText = document.getElementById(inputId).value.toLowerCase().trim();
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.module-item');
    const noResults = document.getElementById(noResultsId);
    
    let foundMatches = 0;
    
    // No search text, show all
    if (searchText === '') {
        items.forEach(item => {
            item.style.display = "";
            // Remove any highlights if they exist
            const nameElement = item.querySelector('.module-name');
            nameElement.innerHTML = nameElement.textContent;
        });
        noResults.classList.add('d-none');
        return;
    }
    
    // Process each item with improved matching
    items.forEach(item => {
        const nameElement = item.querySelector('.module-name');
        const itemText = nameElement.textContent.toLowerCase();
        
        // Check for match using different methods
        if (itemText.includes(searchText)) {
            // Highlight matching text
            const highlightedText = nameElement.textContent.replace(
                new RegExp(searchText, 'gi'),
                match => `<span class="bg-warning text-dark">${match}</span>`
            );
            nameElement.innerHTML = highlightedText;
            
            item.style.display = "";
            foundMatches++;
        } else if (calculateLevenshteinDistance(itemText, searchText) <= 2 && searchText.length > 2) {
            // Fuzzy matching for typos (if search is at least 3 chars)
            nameElement.innerHTML = `<span class="fst-italic">${nameElement.textContent}</span>`;
            item.style.display = "";
            foundMatches++;
        } else {
            // Reset text and hide
            nameElement.innerHTML = nameElement.textContent;
            item.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (foundMatches === 0) {
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
    }
}

// Clear search with improved reset
function clearSearch(inputId, containerId, noResultsId) {
    document.getElementById(inputId).value = '';
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.module-item');
    const noResults = document.getElementById(noResultsId);
    
    // Show all items and reset formatting
    items.forEach((item) => {
        item.style.display = "";
        // Reset any highlighting
        const nameElement = item.querySelector('.module-name');
        nameElement.innerHTML = nameElement.textContent;
    });

    // Hide no results message
    noResults.classList.add('d-none');
}

// Levenshtein distance algorithm for fuzzy matching
function calculateLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return matrix[b.length][a.length];
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the selected modules hidden inputs
    updateSelectedModules();
    
    // Add form submit event
    document.getElementById('moduleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateSelectedModules();
        
        // Send form via AJAX instead of normal submission
        submitFormWithAjax(this);
    });
    
    // Assigned modules search
    const searchAssigned = document.getElementById('searchAssigned');
    const clearAssignedBtn = document.getElementById('clearAssigned');
    
    searchAssigned.addEventListener('input', function() {
        filterModules('searchAssigned', 'assignedContainer', 'noResultsAssigned');
    });
    
    clearAssignedBtn.addEventListener('click', function() {
        clearSearch('searchAssigned', 'assignedContainer', 'noResultsAssigned');
    });
    
    // Available modules search
    const searchAvailable = document.getElementById('searchAvailable');
    const clearAvailableBtn = document.getElementById('clearAvailable');
    
    searchAvailable.addEventListener('input', function() {
        filterModules('searchAvailable', 'availableContainer', 'noResultsAvailable');
    });
    
    clearAvailableBtn.addEventListener('click', function() {
        clearSearch('searchAvailable', 'availableContainer', 'noResultsAvailable');
    });
});

// Function to submit the form with AJAX
function submitFormWithAjax(form) {
    // Collect assigned modules
    const assignedModules = [];
    document.querySelectorAll('#assignedContainer .module-item').forEach(item => {
        assignedModules.push({
            id: item.getAttribute('data-module-id'),
            name: item.querySelector('.module-name').textContent
        });
    });

    // Prepare the data object to send
    const data = {
        id: document.getElementById('roleId').value,
        name: document.getElementById('roleName').textContent,
        modules: assignedModules
    };

    const url = form.getAttribute('action');

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';

    // Hide previous notifications
    hideNotifications();

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.text();
    })
    .then(data => {
        // Show success notification
        showNotification('success', data || 'Cập nhật quyền thành công!');
        document.getElementById('notificationArea').scrollIntoView({behavior: 'smooth'});
    })
    .catch(error => {
        let errorMessage = 'Đã xảy ra lỗi khi cập nhật quyền!';
        if (error.message) {
            errorMessage = error.message;
        }
        showNotification('error', errorMessage);
        document.getElementById('notificationArea').scrollIntoView({behavior: 'smooth'});
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    });
}

// Function to show notification
function showNotification(type, message) {
    const notificationArea = document.getElementById('notificationArea');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    notificationArea.style.display = 'block';
    
    if (type === 'success') {
        successMessage.textContent = message;
        successAlert.style.display = 'block';
        errorAlert.style.display = 'none';
    } else {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';
        successAlert.style.display = 'none';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotifications();
    }, 5000);
}

// Function to hide all notifications
function hideNotifications() {
    const notificationArea = document.getElementById('notificationArea');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    
    notificationArea.style.display = 'none';
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
}