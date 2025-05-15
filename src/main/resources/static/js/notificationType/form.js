
document.addEventListener("DOMContentLoaded", async function () {
    const iconList = document.getElementById("iconList");
    const iconSearch = document.getElementById("iconSearch");
    const iconInput = document.getElementById("icon");
    const selectedIconPreview = document.getElementById("selectedIconPreview");
    const saveIconButton = document.getElementById("saveIcon");

    // Update preview when the page loads
    updateIconPreview();

    async function fetchBootstrapIcons() {
        try {
            const response = await fetch("https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css");
            const cssText = await response.text();

            // Find all classes like ".bi-*"
            const iconRegex = /\.bi-([a-z0-9-]+)::before/g;
            let match;
            const icons = [];

            while ((match = iconRegex.exec(cssText)) !== null) {
                icons.push(`bi-${match[1]}`);
            }

            return icons;
        } catch (error) {
            console.error("Cannot fetch icon list:", error);
            return [];
        }
    }

    function renderIcons(icons, filter = "") {
        iconList.innerHTML = "";
        const filteredIcons = icons.filter(icon => icon.includes(filter));

        if (filteredIcons.length === 0) {
            iconList.innerHTML = `
                        <div class="alert alert-info w-100 text-center">
                            <i class="bi bi-info-circle me-2"></i>No icons found matching "${filter}"
                        </div>
                    `;
            return;
        }

        let selectedIcon = null;

        filteredIcons.forEach(icon => {
            const iconElement = document.createElement("div");
            iconElement.classList.add("p-3", "text-center", "border", "rounded", "icon-item");
            iconElement.style.cursor = "pointer";
            iconElement.style.width = "90px";
            iconElement.style.transition = "all 0.2s ease";

            const isSelected = iconInput.value === icon;
            if (isSelected) {
                iconElement.classList.add("selected-icon");
                iconElement.style.backgroundColor = "#e8f0fe";
                iconElement.style.borderColor = "#0d6efd";
                selectedIcon = iconElement;
            } else {
                iconElement.style.backgroundColor = "white";
                iconElement.style.borderColor = "#dee2e6";
            }

            iconElement.innerHTML = `
                        <i class="bi ${icon} fs-3 mb-2"></i>
                        <div><small class="text-truncate d-block" style="font-size: 0.7rem;">${icon}</small></div>
                    `;

            iconElement.addEventListener("click", () => {
                document.querySelectorAll(".icon-item").forEach(item => {
                    item.classList.remove("selected-icon");
                    item.style.backgroundColor = "white";
                    item.style.borderColor = "#dee2e6";
                });

                iconElement.classList.add("selected-icon");
                iconElement.style.backgroundColor = "#e8f0fe";
                iconElement.style.borderColor = "#0d6efd";

                selectedIcon = iconElement;
            });

            // Hover effect
            iconElement.addEventListener("mouseenter", () => {
                if (!iconElement.classList.contains("selected-icon")) {
                    iconElement.style.backgroundColor = "#f8f9fa";
                    iconElement.style.transform = "translateY(-3px)";
                    iconElement.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }
            });

            iconElement.addEventListener("mouseleave", () => {
                if (!iconElement.classList.contains("selected-icon")) {
                    iconElement.style.backgroundColor = "white";
                    iconElement.style.transform = "translateY(0)";
                    iconElement.style.boxShadow = "none";
                }
            });

            iconList.appendChild(iconElement);
        });

        if (selectedIcon) {
            setTimeout(() => {
                selectedIcon.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    function updateIconPreview() {
        if (iconInput.value) {
            selectedIconPreview.className = `bi ${iconInput.value}`;
        } else {
            selectedIconPreview.className = "bi bi-image";
        }
    }

    // Save the selected icon when the Apply Selection button is clicked
    saveIconButton.addEventListener("click", function() {
        const selectedIconElement = document.querySelector(".icon-item.selected-icon");
        if (selectedIconElement) {
            const iconClass = selectedIconElement.querySelector("i").className.split(" ")[1];
            iconInput.value = iconClass;
            updateIconPreview();
        }
    });

    iconInput.addEventListener("input", updateIconPreview);

    const icons = await fetchBootstrapIcons();
    renderIcons(icons);

    iconSearch.addEventListener("input", function () {
        renderIcons(icons, this.value);
    });
});