   document.addEventListener("DOMContentLoaded", () => {
      const selectAllCheckbox = document.getElementById("selectAll");
      const itemCheckboxes = document.querySelectorAll(".selectItem");
      const deleteAllButton = document.getElementById("deleteAll");
      const deleteModal = document.getElementById("deleteModal");
      const deleteAllModal = document.getElementById("deleteAllModal");
      const selectedCount = document.getElementById("selectedCount");
      const deleteCount = document.getElementById("deleteCount");
      const deleteAllForm = document.getElementById("deleteAllForm");
      const deleteAllIdsInput = document.getElementById("deleteAllIds");
      const deleteAllModuleGroupsForm = document.getElementById(
        "deleteAllModuleGroupsForm"
      );

      function updateDeleteButton() {
        const checkedCount = [...itemCheckboxes].filter(
          (cb) => cb.checked
        ).length;
        selectedCount.textContent = checkedCount;
        deleteAllButton.disabled = checkedCount === 0;
      }

      selectAllCheckbox.addEventListener("change", () => {
        itemCheckboxes.forEach(
          (cb) => (cb.checked = selectAllCheckbox.checked)
        );
        updateDeleteButton();
      });

      itemCheckboxes.forEach((cb) => {
        cb.addEventListener("change", updateDeleteButton);
      });

      deleteAllModal.addEventListener("show.bs.modal", (event) => {
        const selectedIds = [...itemCheckboxes]
          .filter((cb) => cb.checked)
          .map((cb) => cb.value);

        if (selectedIds.length === 0) {
          event.preventDefault();
          alert("Please select at least one module group to delete.");
          return;
        }

        deleteCount.textContent = selectedIds.length;
        deleteAllIdsInput.value = selectedIds.join(",");
      });

      deleteModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        const id = button.getAttribute("data-id");
        if (id) {
          const form = deleteModal.querySelector("#deleteForm");
          form.action = `/module-groups/delete/${id}`;

          // Add submit event listener to handle form submission
          form.addEventListener("submit", function (e) {
            const deleteButton = form.querySelector('button[type="submit"]');
            const originalText = deleteButton.innerHTML;
            deleteButton.innerHTML =
              '<i class="spinner-border spinner-border-sm"></i> Deleting...';
            deleteButton.disabled = true;
          });
        }
      });

      deleteAllForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const selectedIds = deleteAllIdsInput.value;

        // Get CSRF token if available (for Spring Security)
        const csrfToken = document
          .querySelector('meta[name="_csrf"]')
          ?.getAttribute("content");
        const csrfHeader = document
          .querySelector('meta[name="_csrf_header"]')
          ?.getAttribute("content");

        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
        };

        // Add CSRF header if available
        if (csrfToken && csrfHeader) {
          headers[csrfHeader] = csrfToken;
        }

        // Show loading state
        const deleteButton = deleteAllForm.querySelector(
          'button[type="submit"]'
        );
        const originalButtonText = deleteButton.innerHTML;
        deleteButton.disabled = true;
        deleteButton.innerHTML =
          '<i class="spinner-border spinner-border-sm"></i> Deleting...';

        fetch("/module-groups/delete-selected", {
          method: "POST",
          headers: headers,
          body: selectedIds
            .split(",")
            .map((id) => `ids=${id}`)
            .join("&"),
        })
          .then((response) => {
            // Close the modal
            const modalEl = document.getElementById("deleteAllModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // Check if the response redirected to our page with a success/error parameter
            const redirectUrl = response.url;
            if (redirectUrl && redirectUrl.includes("module-groups")) {
              window.location.href = redirectUrl;
              return;
            }

            if (!response.ok) {
              return response.text().then((text) => {
                throw new Error(text || "Failed to delete module groups");
              });
            }

            window.location.reload();
          })
          .catch((error) => {
            console.error("Error:", error);
            // Restore button state
            deleteButton.disabled = false;
            deleteButton.innerHTML = originalButtonText;

            alert(
              "An error occurred while deleting module groups: " + error.message
            );
          });
      });

      deleteAllModal.addEventListener("hidden.bs.modal", () => {
        deleteCount.textContent = "0";
        deleteAllIdsInput.value = "";
      });

      updateDeleteButton();

      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipTriggerList.forEach(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
      );

      // Handle Delete All Module Groups form submission
      if (deleteAllModuleGroupsForm) {
        deleteAllModuleGroupsForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            // Get CSRF token if available (for Spring Security)
            const csrfToken = document
              .querySelector('meta[name="_csrf"]')
              ?.getAttribute("content");
            const csrfHeader = document
              .querySelector('meta[name="_csrf_header"]')
              ?.getAttribute("content");

            const headers = {
              "Content-Type": "application/json",
            };

            // Add CSRF header if available
            if (csrfToken && csrfHeader) {
              headers[csrfHeader] = csrfToken;
            }

            // Update UI to show loading
            const deleteButton = e.target.querySelector(
              'button[type="submit"]'
            );
            const originalButtonText = deleteButton.innerHTML;
            deleteButton.disabled = true;
            deleteButton.innerHTML =
              '<i class="spinner-border spinner-border-sm"></i> Deleting...';

            const response = await fetch("/module-groups/delete-all", {
              method: "POST",
              headers: headers,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                errorText || "Failed to delete all module groups"
              );
            }

            // Hide modal if it exists
            const modalEl = document.getElementById(
              "deleteAllModuleGroupsModal"
            );
            if (modalEl) {
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }

            // Show success message and reload
            alert("All module groups have been deleted successfully");
            window.location.reload();
          } catch (error) {
            console.error("Error:", error);

            // Restore button state
            const deleteButton = e.target.querySelector(
              'button[type="submit"]'
            );
            if (deleteButton) {
              deleteButton.disabled = false;
              deleteButton.innerHTML =
                '<i class="fas fa-trash me-1"></i>Delete All';
            }

            alert(
              "An error occurred while deleting all module groups: " +
                error.message
            );
          }
        });
      }
    });