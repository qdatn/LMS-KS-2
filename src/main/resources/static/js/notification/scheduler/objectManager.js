class ObjectManager {
    constructor() {
        // Object selection elements
        this.objectList = document.getElementById("objectList");
        this.saveObjectBtn = document.getElementById("saveObject");
        this.searchObjectsInput = document.getElementById("searchObjects");
        this.noObjectsMessage = document.getElementById("noObjectsMessage");
        this.objectsDatalist = document.getElementById("objectsList");
        this.objectIdInput = document.getElementById("objectId");
        this.selectedObjectIdInput = document.getElementById("selectedObjectId");

        // Store objects list for each type
        this.objectTypeMapping = {};

        // Bootstrap modal
        if (typeof bootstrap !== 'undefined') {
            this.objectModal = new bootstrap.Modal(document.getElementById('objectModal'));
        }
    }

    init() {
        this.setupEventListeners();
        this.loadInitialObjectDetails();
    }

    setupEventListeners() {
        // Save selected object
        this.saveObjectBtn.addEventListener("click", () => {
            const selectedRadio = document.querySelector('input[name="selectedObject"]:checked');
            if (selectedRadio) {
                const selectedObjectId = selectedRadio.value;
                const selectedObjectName = selectedRadio.nextElementSibling.textContent;

                this.objectIdInput.value = selectedObjectName;
                this.selectedObjectIdInput.value = selectedObjectId;
            }
        });

        // Object search
        this.searchObjectsInput.addEventListener("input", () => {
            const searchTerm = this.searchObjectsInput.value.toLowerCase().trim();
            const objectItems = document.querySelectorAll(".object-item");

            let hasMatches = false;
            objectItems.forEach(item => {
                const label = item.querySelector("label").textContent.toLowerCase();
                const matches = label.includes(searchTerm);
                item.style.display = matches ? "" : "none";
                if (matches) hasMatches = true;
            });

            if (searchTerm && !hasMatches) {
                this.objectList.querySelectorAll("p.text-center").forEach(el => el.remove());
                const noMatchesMessage = document.createElement("p");
                noMatchesMessage.className = "text-center text-muted py-3";
                noMatchesMessage.innerHTML = "No objects match your search";
                this.objectList.appendChild(noMatchesMessage);
            }
        });
    }

    fetchObjectsByType(typeUrl) {
        this.objectList.innerHTML = "";
        const loadingMessage = document.createElement("p");
        loadingMessage.id = "loadingMessage";
        loadingMessage.className = "text-center text-muted py-3";
        loadingMessage.innerHTML = "Loading objects...";
        this.objectList.appendChild(loadingMessage);
        this.saveObjectBtn.disabled = true;

        // Check if we've already cached these objects
        if (this.objectTypeMapping[typeUrl]) {
            this.populateObjects(this.objectTypeMapping[typeUrl]);
            return;
        }

        fetch(`/api/v1/notifications/get-object-type`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ typeUrl })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                // Check if content type is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return response.json();
                } else {
                    throw new Error("Server returned non-JSON response. Please check API endpoint.");
                }
            })
            .then(objects => {
                // Cache the objects for this type
                this.objectTypeMapping[typeUrl] = objects;
                this.populateObjects(objects);
            })
            .catch(error => {
                console.error("Error fetching objects:", error);
                this.objectList.innerHTML = "";
                const errorMessage = document.createElement("p");
                errorMessage.className = "text-center text-danger py-3";
                errorMessage.innerHTML = `Error loading objects: ${error.message}`;
                this.objectList.appendChild(errorMessage);
            });
    }

    populateObjects(objects) {
        this.objectList.innerHTML = "";

        // Also populate datalist for search
        if (this.objectsDatalist) {
            this.objectsDatalist.innerHTML = "";
        }

        if (!objects || objects.length === 0) {
            const noObjectsElement = document.createElement("p");
            noObjectsElement.className = "text-center text-muted py-3";
            noObjectsElement.innerHTML = "No objects found for this type";
            this.objectList.appendChild(noObjectsElement);
            this.saveObjectBtn.disabled = true;
            return;
        }

        // Check if current objectId matches any of the objects
        const currentObjectId = this.selectedObjectIdInput.value;
        let found = false;

        objects.forEach(obj => {
            // Add to datalist if it exists
            if (this.objectsDatalist) {
                const option = document.createElement('option');
                option.value = obj.name;
                this.objectsDatalist.appendChild(option);
            }

            const objectItem = document.createElement("div");
            objectItem.classList.add("object-item", "py-2", "px-3", "border-bottom", "d-flex", "align-items-center");

            // Check if this is the currently selected object
            const isSelected = obj.id.toString() === currentObjectId;
            if (isSelected) {
                found = true;
                objectItem.classList.add("bg-light");
                // Update the object name in the input field if it's not already set correctly
                if (this.objectIdInput.value !== obj.name) {
                    this.objectIdInput.value = obj.name;
                }
            }

            objectItem.innerHTML = `
                <input type="radio" name="selectedObject" class="form-check-input object-radio me-2"
                       value="${obj.id}" id="object_${obj.id}" ${isSelected ? 'checked' : ''}>
                <label class="form-check-label text-md" for="object_${obj.id}">${obj.name}</label>
            `;
            this.objectList.appendChild(objectItem);
        });

        const objectRadios = document.querySelectorAll(".object-radio");
        objectRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                this.saveObjectBtn.disabled = !radio.checked;

                // Update highlighting
                document.querySelectorAll(".object-item").forEach(item => {
                    item.classList.remove("bg-light");
                });
                if (radio.checked) {
                    radio.closest(".object-item").classList.add("bg-light");
                }
            });
        });

        // Enable save button if any object is pre-selected
        this.saveObjectBtn.disabled = !found;
    }

    loadInitialObjectDetails() {
        // Load object details if we have a type and object ID
        const typeSelect = document.getElementById("typeSelect");
        if (this.selectedObjectIdInput.value && typeSelect.value) {
            const selectedOption = typeSelect.options[typeSelect.selectedIndex];
            const selectedTypeUrl = selectedOption.dataset.url;

            if (selectedTypeUrl) {
                fetch(`/api/v1/notifications/get-object-type`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ typeUrl: selectedTypeUrl })
                })
                    .then(response => response.json())
                    .then(objects => {
                        this.objectTypeMapping[selectedTypeUrl] = objects;

                        // Find the matching object and update the name
                        const selectedId = this.selectedObjectIdInput.value;
                        const matchedObject = objects.find(obj => obj.id.toString() === selectedId);

                        if (matchedObject) {
                            this.objectIdInput.value = matchedObject.name;
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching objects for initial load:", error);
                    });
            }
        }
    }
}