  $(document).ready(function () {
    let sortableInstances = [];

    // Initialize Sortable when modal is shown
    $("#positionModal").on("shown.bs.modal", function () {
      initializeSortable();
    });

    // Clean up Sortable when modal is hidden
    $("#positionModal").on("hidden.bs.modal", function () {
      destroySortable();
    });

    function initializeSortable() {
      $(".material-list").each(function () {
        const sortable = new Sortable(this, {
          group: "materials",
          animation: 150,
          ghostClass: "sortable-ghost",
          onEnd: function (evt) {
            updateOrderNumbers();
          },
        });
        sortableInstances.push(sortable);
      });
    }

    function destroySortable() {
      sortableInstances.forEach((instance) => {
        instance.destroy();
      });
      sortableInstances = [];
    }

    function updateOrderNumbers() {
      $(".material-list").each(function () {
        $(this)
          .find(".material-item")
          .each(function (index) {
            $(this)
              .find(".material-number")
              .text(index + 1 + ".");
          });
      });
    }

    // Save positions
    $("#savePositions").on("click", function () {
      const updates = [];
      $(".material-list").each(function () {
        const sessionId = $(this).data("session-id");
        $(this)
          .find(".material-item")
          .each(function (index) {
            const materialId = $(this).data("material-id");
            updates.push({
              materialId: materialId,
              sessionId: sessionId,
              order: index + 1,
            });
          });
      });

      $.ajax({
        url:
          window.location.protocol +
          "//" +
          window.location.host +
          "/course-materials/update-positions",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(updates),
        success: function (response) {
          $("#positionModal").modal("hide");
          window.location.reload();
        },
        error: function (xhr) {
          alert("Error updating positions: " + xhr.responseText);
        },
      });
    });

    // Toggle view functionality
    $("#toggleViewBtn").on("click", function () {
      const mainTableView = $("#mainTableView");
      const testView = $("#testView");
      const isMainView = mainTableView.is(":visible");

      if (isMainView) {
        mainTableView.hide();
        testView.show();
        $(this).html('<i class="bi bi-table"></i>');
      } else {
        mainTableView.show();
        testView.hide();
        $(this).html('<i class="bi bi-list-ul"></i>');
      }
    });

    // Initialize Bootstrap modals
    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal")
    );
    const deleteAllModal = new bootstrap.Modal(
      document.getElementById("deleteAllModal")
    );
    const importModal = new bootstrap.Modal(
      document.getElementById("importModal")
    );

    // Select all functionality
    $("#selectAll").on("change", function () {
      $(".selectItem").prop("checked", $(this).prop("checked"));
      updateDeleteButton();
    });

    // Individual checkbox change
    $(".selectItem").on("change", updateDeleteButton);

    function updateDeleteButton() {
      const checkedCount = $(".selectItem:checked").length;
      $("#selectedCount").text(checkedCount);
      $("#deleteAll").prop("disabled", checkedCount === 0);
    }

    // Delete modal functionality
    $("#deleteModal").on("show.bs.modal", function (event) {
      const button = $(event.relatedTarget);
      const id = button.data("id");
      if (id) {
        $("#deleteForm").attr("action", `/course-materials/delete/${id}`);
      }
    });

    // Delete all modal functionality
    $("#deleteAllModal").on("show.bs.modal", function () {
      const selectedIds = $(".selectItem:checked")
        .map(function () {
          return $(this).val();
        })
        .get();

      if (selectedIds.length === 0) {
        alert("Please select at least one material to delete.");
        return false;
      }
      $("#deleteCount").text(selectedIds.length);
    });

    // Confirm delete all
    $("#confirmDeleteAll").on("click", function () {
      const selectedIds = $(".selectItem:checked")
        .map(function () {
          return $(this).val();
        })
        .get();

      $.ajax({
        url:
          window.location.protocol +
          "//" +
          window.location.host +
          "/course-materials/delete-all",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ ids: selectedIds }),
        success: function () {
          window.location.reload();
        },
        error: function (xhr) {
          alert("Error: " + xhr.responseText);
        },
      });
    });

    // Initialize
    updateDeleteButton();

    // Handle material click in testView
    window.handleMaterialClick = function (element) {
      const item = $(element).closest(".material-item");
      showMaterialContent(item);
    };

    // Text Editor functionality
    let editor = null;

    $("#editTextBtn").on("click", function() {
      $("#textContent").addClass("d-none");
      $("#textEditorContainer").removeClass("d-none");
      
      if (!editor) {
        ClassicEditor
          .create(document.querySelector('#textEditorArea'), {
            toolbar: {
              items: [
                'undo', 'redo',
                '|', 'heading',
                '|', 'bold', 'italic', 'strikethrough', 'underline',
                '|', 'bulletedList', 'numberedList',
                '|', 'outdent', 'indent',
                '|', 'link', 'blockQuote', 'insertTable', 'mediaEmbed',
                '|', 'horizontalLine',
                '|', 'removeFormat'
              ]
            },
            language: 'en',
            table: {
              contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
              ]
            }
          })
          .then(newEditor => {
            editor = newEditor;
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        editor.isReadOnly = false;
      }
    });

    $("#cancelTextBtn").on("click", function() {
      if (editor) {
        editor.isReadOnly = true;
      }
      $("#textEditorContainer").addClass("d-none");
      $("#textContent").removeClass("d-none");
    });

    $("#saveTextBtn").on("click", function() {
      const materialId = $(".material-item.active").data("material-id");
      const newContent = editor ? editor.getData() : $("#textEditorArea").val();
      
      $.ajax({
        url: `/api/materials/${materialId}/text`,
        method: 'PUT',
        contentType: 'text/html',
        data: newContent,
        success: function(response) {
          $("#textContent").html(newContent);
          if (editor) {
            editor.isReadOnly = true;
          }
          $("#textEditorContainer").addClass("d-none");
          $("#textContent").removeClass("d-none");
          showToast("Text content updated successfully", "success");
        },
        error: function(error) {
          console.error('Error saving text content:', error);
          showToast("Error saving text content", "error");
        }
      });
    });

    function showMaterialContent(item) {
      $(
        "#defaultContent, #pdfViewer, #videoPlayer, #localVideoPlayer, #audioPlayer, #textEditor"
      ).addClass("d-none");
      $("#materialDetails").removeClass("d-none");

      const materialId = item.data("material-id");
      const materialName = item.data("material-name");
      const materialDescription = item.data("material-description");
      const materialType = item.data("material-type");
      const materialUrl = item.data("material-url");
      const materialTime = item.data("material-time");

      $("#materialName").text(materialName);
      $("#materialDescription").text(
        materialDescription || "No description available"
      );
      $("#materialType").text(materialType);
      $("#materialTime").text(
        materialTime ? `${materialTime} minutes` : "Duration not specified"
      );

      switch (materialType) {
        case "PDF":
          $("#pdfViewer").removeClass("d-none");
          $("#pdfTitle").html(`${materialName} <span class="text-muted ms-2">(${materialTime} min)</span>`);
          $("#pdfFrame").attr("src", materialUrl + "#toolbar=0");
          $("#pdfDownloadLink").attr("href", materialUrl);
          break;
        case "YOUTUBE":
          $("#videoPlayer").removeClass("d-none");
          $("#videoTitle").html(`${materialName} <span class="text-muted ms-2">(${materialTime} min)</span>`);
          let embedUrl = materialUrl;
          if (materialUrl) {
            const videoId = extractYouTubeVideoId(materialUrl);
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          }
          $("#videoFrame").attr("src", embedUrl);
          $("#videoLink").attr("href", materialUrl);
          break;
        case "VIDEO":
          $("#localVideoPlayer").removeClass("d-none");
          $("#localVideoTitle").html(`${materialName} <span class="text-muted ms-2">(${materialTime} min)</span>`);
          $("#localVideoElement source").attr("src", materialUrl);
          $("#localVideoElement")[0].load();
          $("#localVideoDownloadLink").attr("href", materialUrl);
          break;
        case "AUDIO":
          $("#audioPlayer").removeClass("d-none");
          $("#audioTitle").html(`${materialName} <span class="text-muted ms-2">(${materialTime} min)</span>`);
          $("#audioElement source").attr("src", materialUrl);
          $("#audioElement")[0].load();
          $("#audioDownloadLink").attr("href", materialUrl);
          break;
        case "TEXT":
          $("#textEditor").removeClass("d-none");
          $("#textTitle").html(`${materialName} <span class="text-muted ms-2">(${materialTime} min)</span>`);
          if (materialUrl) {
            fetch(materialUrl)
              .then(response => response.text())
              .then(text => {
                $("#textContent").html(text);
                if (editor) {
                  editor.setData(text);
                } else {
                  $("#textEditorArea").val(text);
                }
              })
              .catch(error => {
                console.error('Error loading text content:', error);
                $("#textContent").html("Error loading content");
              });
          }
          $("#textDownloadLink").attr("href", materialUrl);
          break;
        default:
          $("#defaultContent").removeClass("d-none");
          break;
      }

      $(".material-item").removeClass("active");
      item.addClass("active");
    }

    function extractYouTubeVideoId(url) {
      if (!url) return null;
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
        /youtube\.com\/watch\?.*v=([^&]+)/,
        /youtube\.com\/shorts\/([^&?/]+)/,
      ];
      for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    }

    $(".material-item").on("click", function (e) {
      if (!$(e.target).closest(".btn").length) {
        showMaterialContent($(this));
      }
    });

    $(".material-type-badge").each(function () {
      const type = $(this).text().trim();
      applyBadgeClass($(this), type);
    });

    $("#positionModal").on("shown.bs.modal", function () {
      $("#positionModal .badge").each(function () {
        const type = $(this).text().trim();
        applyBadgeClass($(this), type);
      });
    });

    function applyBadgeClass(element, type) {
      element.removeClass(
        "bg-soft-red bg-soft-blue bg-soft-green bg-soft-purple bg-soft-orange bg-secondary"
      );
      switch (type) {
        case "PDF":
          element.addClass("bg-soft-red");
          break;
        case "YOUTUBE":
          element.addClass("bg-soft-blue");
          break;
        case "TEXT":
          element.addClass("bg-soft-green");
          break;
        case "VIDEO":
          element.addClass("bg-soft-purple");
          break;
        case "AUDIO":
          element.addClass("bg-soft-orange");
          break;
        default:
          element.addClass("bg-secondary");
      }
    }

    window.handleMaterialDelete = function (event, button) {
      event.stopPropagation();
      const materialId = $(button).data("material-id");
      const materialName = $(button)
        .closest(".material-item")
        .data("material-name");

      if (confirm(`Are you sure you want to delete "${materialName}"?`)) {
        $.ajax({
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            `/course-materials/delete/${materialId}`,
          method: "GET",
          success: function () {
            $(`.material-item[data-material-id="${materialId}"]`).remove();
            $(`tr:has(input[value="${materialId}"])`).remove();

            const alert = $("<div>").addClass(
              "alert alert-success alert-dismissible fade show"
            ).html(`
                                  <strong>Success!</strong> Material "${materialName}" has been deleted.
                                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                              `);
            $(".card-body").first().prepend(alert);

            setTimeout(() => {
              alert.alert("close");
            }, 3000);
          },
          error: function (xhr) {
            alert("Error deleting material: " + xhr.responseText);
          },
        });
      }
    };

    $("#mainTableView").hide();
    $("#testView").show();
    $("#toggleViewBtn").html('<i class="bi bi-table"></i>');

    let currentSessionId = null;

    $(document).on("click", ".material-options .dropdown-item", function (e) {
      e.preventDefault();
      const type = $(this).find("span").text().replace("Add ", "").trim();
      currentSessionId = $(this)
        .closest(".accordion-item")
        .find(".accordion-button")
        .data("bs-target")
        .replace("#ss", "");

      if (type === "Multiple Types") {
        $("#addMultipleTypesModal").modal("show");
      } else {
        const modalTitle = $("#addMaterialModalLabel");
        modalTitle.text("Add " + type + " Material");
        $("#multipleMaterialsContainer .material-entry:not(:first)").remove();
        $(
          "#multipleMaterialsContainer .material-entry:first .material-name"
        ).val("");
        $(
          "#multipleMaterialsContainer .material-entry:first .type-specific-fields"
        ).empty();
        const materialType =
          type === "YouTube URL" ? "YOUTUBE" : type.toUpperCase();
        showTypeSpecificFields(
          materialType,
          $(
            "#multipleMaterialsContainer .material-entry:first .type-specific-fields"
          )
        );
        $("#addMaterialModal").modal("show");
      }
    });

    $("#addAnotherMaterial").on("click", function () {
      const container = $("#multipleMaterialsContainer");
      const count = container.children().length + 1;
      const firstEntry = container.children().first();
      const type = firstEntry.find(".type-specific-fields").data("type");

      const newEntry = `
                  <div class="material-entry mb-3 p-3 border rounded">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">Material #${count}</h6>
                          <button type="button" class="btn btn-sm btn-outline-danger remove-material">
                              <i class="bi bi-trash"></i>
                          </button>
                      </div>
                      <div class="mb-3">
                          <label class="form-label">Material Name</label>
                          <input type="text" class="form-control material-name" required>
                      </div>
                      <div class="type-specific-fields">
                          <!-- Dynamic fields will be inserted here -->
                      </div>
                  </div>
              `;
      container.append(newEntry);
      const newEntryElement = container.children().last();
      showTypeSpecificFields(
        type,
        newEntryElement.find(".type-specific-fields")
      );
    });

    $(document).on(
      "click",
      "#multipleMaterialsContainer .remove-material",
      function () {
        const container = $("#multipleMaterialsContainer");
        if (container.children().length > 1) {
          $(this).closest(".material-entry").remove();
          container.children().each(function (index) {
            $(this)
              .find("h6")
              .text(`Material #${index + 1}`);
          });
        }
      }
    );

    $("#addAnotherType").on("click", function () {
      const container = $("#multipleTypesContainer");
      const count = container.children().length + 1;

      const newEntry = `
                  <div class="material-entry mb-3 p-3 border rounded">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">Material #${count}</h6>
                          <button type="button" class="btn btn-sm btn-outline-danger remove-material">
                              <i class="bi bi-trash"></i>
                          </button>
                      </div>
                      <div class="mb-3">
                          <label class="form-label">Material Name</label>
                          <input type="text" class="form-control material-name" required>
                      </div>
                      <div class="mb-3 type-select-container">
                          <label class="form-label">Material Type</label>
                          <select class="form-select material-type" required>
                              <option value="">Select Type</option>
                              <option value="PDF">PDF</option>
                              <option value="YOUTUBE">YouTube</option>
                              <option value="VIDEO">Video</option>
                              <option value="AUDIO">Audio</option>
                          </select>
                      </div>
                      <div class="type-specific-fields">
                          <!-- Dynamic fields will be inserted here -->
                      </div>
                  </div>
              `;
      container.append(newEntry);
    });

    $(document).on(
      "click",
      "#multipleTypesContainer .remove-material",
      function () {
        const container = $("#multipleTypesContainer");
        if (container.children().length > 1) {
          $(this).closest(".material-entry").remove();
          container.children().each(function (index) {
            $(this)
              .find("h6")
              .text(`Material #${index + 1}`);
          });
        }
      }
    );

    $("#saveMaterial").on("click", function () {
      const formData = new FormData();
      const courseId = window.location.href.split("courseId=")[1]?.split("&")[0];
      formData.append("courseId", courseId);
      formData.append("sessionId", currentSessionId);
      formData.append("materialCount", $("#multipleMaterialsContainer .material-entry").length);

      let isValid = true;
      let materialCount = 0;
      let pdfCount = 0;
      let videoCount = 0;
      let audioCount = 0;

      $("#multipleMaterialsContainer .material-entry").each(function(index) {
        const entry = $(this);
        const name = entry.find(".material-name").val();
        const type = entry.find(".type-specific-fields").data("type");

        if (!name) {
          alert("Please enter a name for all materials");
          isValid = false;
          return false;
        }

        formData.append(`materials[${materialCount}].name`, name);
        formData.append(`materials[${materialCount}].type`, type);

        switch (type) {
          case "YOUTUBE":
            const youtubeUrl = entry.find('input[type="url"]').val();
            if (!youtubeUrl) {
              alert("Please enter a YouTube URL for all YouTube materials");
              isValid = false;
              return false;
            }
            formData.append(`materials[${materialCount}].youtubeUrl`, youtubeUrl);
            break;
          case "PDF":
            const pdfFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!pdfFile) {
              alert("Please select a PDF file for all PDF materials");
              isValid = false;
              return false;
            }
            formData.append("pdfFiles", pdfFile);
            pdfCount++;
            break;
          case "VIDEO":
            const videoFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!videoFile) {
              alert("Please select a video file for all video materials");
              isValid = false;
              return false;
            }
            formData.append("videoFiles", videoFile);
            videoCount++;
            break;
          case "AUDIO":
            const audioFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!audioFile) {
              alert("Please select an audio file for all audio materials");
              isValid = false;
              return false;
            }
            formData.append("audioFiles", audioFile);
            audioCount++;
            break;
          case "TEXT":
            const textEditor = entry.find(".type-specific-fields").data("editor");
            if (textEditor) {
              const textContent = textEditor.getData();
              if (!textContent) {
                alert("Please enter text content for all text materials");
                isValid = false;
                return false;
              }
              formData.append(`materials[${materialCount}].description`, textContent);
            }
            break;
        }
        materialCount++;
      });

      if (!isValid) return;
      if (materialCount === 0) {
          alert("Please add at least one material");
          return;
      }

      $.ajax({
          url: window.location.protocol + "//" + window.location.host + "/course-materials",
          method: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
              $("#addMaterialModal").modal("hide");
              window.location.reload();
          },
          error: function (xhr, status, error) {
              console.error("Error details:", xhr.responseText);
              alert("Error saving materials: " + error);
          }
      });
    });

    $("#saveMultipleTypes").on("click", function () {
      const formData = new FormData();
      const courseId = window.location.href
        .split("courseId=")[1]
        ?.split("&")[0];
      formData.append("courseId", courseId);
      formData.append("sessionId", currentSessionId);
      formData.append("materialCount", $("#multipleTypesContainer .material-entry").length);

      let isValid = true;
      let materialCount = 0;
      let pdfCount = 0;
      let videoCount = 0;
      let audioCount = 0;

      // Count total materials first
      $("#multipleTypesContainer .material-entry").each(function () {
        materialCount++;
      });

      // Add material count first
      formData.append("materialCount", materialCount);

      // Then process each material
      $("#multipleTypesContainer .material-entry").each(function (index) {
        const entry = $(this);
        const name = entry.find(".material-name").val();
        const type = entry.find(".material-type").val();

        if (!name) {
          alert("Please enter a name for all materials");
          isValid = false;
          return false;
        }

        if (!type) {
          alert("Please select a type for all materials");
          isValid = false;
          return false;
        }

        formData.append(`materials[${index}].name`, name);
        formData.append(`materials[${index}].type`, type);

        switch (type) {
          case "YOUTUBE":
            const youtubeUrl = entry.find('input[type="url"]').val();
            if (!youtubeUrl) {
              alert("Please enter a YouTube URL for all YouTube materials");
              isValid = false;
              return false;
            }
            formData.append(
              `materials[${index}].youtubeUrl`,
              youtubeUrl
            );
            break;
          case "PDF":
            const pdfFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!pdfFile) {
              alert("Please select a PDF file for all PDF materials");
              isValid = false;
              return false;
            }
            formData.append(`pdfFiles[${pdfCount}]`, pdfFile);
            pdfCount++;
            break;
          case "VIDEO":
            const videoFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!videoFile) {
              alert("Please select a video file for all video materials");
              isValid = false;
              return false;
            }
            formData.append(`videoFiles[${videoCount}]`, videoFile);
            videoCount++;
            break;
          case "AUDIO":
            const audioFile = entry.find('input[type="file"]')[0]?.files[0];
            if (!audioFile) {
              alert("Please select an audio file for all audio materials");
              isValid = false;
              return false;
            }
            formData.append(`audioFiles[${audioCount}]`, audioFile);
            audioCount++;
            break;
        }
      });

      if (!isValid) return;
      if (materialCount === 0) {
        alert("Please add at least one material");
        return;
      }

      // Log form data for debugging
      console.log("Form data contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      $.ajax({
        url:
          window.location.protocol +
          "//" +
          window.location.host +
          "/course-materials",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          $("#addMultipleTypesModal").modal("hide");
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error("Error details:", xhr.responseText);
          alert("Error saving materials: " + error);
        },
      });
    });

    function showTypeSpecificFields(type, container) {
      container.data("type", type);
      let html = "";
      switch (type) {
        case "PDF":
          html = `
                          <div class="mb-3">
                              <label class="form-label">PDF File</label>
                              <input type="file" name="pdfFiles" class="form-control" accept=".pdf" required>
                              <div class="invalid-feedback">Please upload a PDF file.</div>
                          </div>
                      `;
          container.html(html);
          break;
        case "YOUTUBE":
          html = `
                          <div class="mb-3">
                              <label class="form-label">YouTube URL</label>
                              <input type="url" class="form-control"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    pattern="^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/.+$" required>
                              <div class="invalid-feedback">Please enter a valid YouTube URL.</div>
                          </div>
                      `;
          container.html(html);
          break;
        case "VIDEO":
          html = `
                          <div class="mb-3">
                              <label class="form-label">Video File</label>
                              <input type="file" name="videoFiles" class="form-control" accept="video/*" required>
                              <div class="invalid-feedback">Please upload a video file.</div>
                          </div>
                      `;
          container.html(html);
          break;
        case "AUDIO":
          html = `
                          <div class="mb-3">
                              <label class="form-label">Audio File</label>
                              <input type="file" name="audioFiles" class="form-control" accept="audio/*" required>
                              <div class="invalid-feedback">Please upload an audio file.</div>
                          </div>
                      `;
          container.html(html);
          break;
        case "TEXT":
          html = `
            <div class="mb-3">
              <label class="form-label">Text Content</label>
              <textarea id="newTextEditor" class="form-control"></textarea>
              <div class="invalid-feedback">Please enter text content.</div>
            </div>
          `;
          container.html(html);
          
          // Initialize CKEditor for new text material
          ClassicEditor
            .create(document.querySelector('#newTextEditor'), {
              toolbar: {
                items: [
                  'undo', 'redo',
                  '|', 'heading',
                  '|', 'bold', 'italic', 'strikethrough', 'underline',
                  '|', 'bulletedList', 'numberedList',
                  '|', 'outdent', 'indent',
                  '|', 'link', 'blockQuote', 'insertTable', 'mediaEmbed',
                  '|', 'horizontalLine',
                  '|', 'removeFormat'
                ]
              },
              language: 'en',
              table: {
                contentToolbar: [
                  'tableColumn',
                  'tableRow',
                  'mergeTableCells'
                ]
              }
            })
            .then(newEditor => {
              // Store the editor instance in the container's data
              container.data('editor', newEditor);
            })
            .catch(error => {
              console.error(error);
            });
          break;
      }
    }

    const style = document.createElement("style");
    style.textContent = `
              #multipleMaterialsContainer::-webkit-scrollbar {
                  width: 8px;
              }
              #multipleMaterialsContainer::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
              }
              #multipleMaterialsContainer::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 4px;
              }
              #multipleMaterialsContainer::-webkit-scrollbar-thumb:hover {
                  background: #555;
              }
          `;
    document.head.appendChild(style);

    // Search functionality with debounce
    let searchTimeout;
    const DEBOUNCE_DELAY = 300;
    let currentPage = 0;
    let pageSize = 5;

    function performSearch(page = 0) {
      clearTimeout(searchTimeout);
      $("#searchLoading").removeClass("d-none");

      const searchParams = {
        name: $("#nameSearch").val().trim(),
        sessionId: $("#sessionSearch").val(),
        type: $("#typeSearch").val(),
        minTime: $("#timeSearch").val(),
        courseId:
          new URLSearchParams(window.location.search).get("courseId") || "",
        page: page,
        size: pageSize,
      };

      // Update URL with search parameters without reloading the page
      const url = new URL(window.location.href);
      url.searchParams.set("page", page);
      window.history.pushState({}, "", url);

      $.ajax({
        url: "/course-materials/search",
        method: "GET",
        data: searchParams,
        success: function (response) {
          console.log("Search response:", response);
          updateTable(response);
          updateTestView(response);
          updatePagination(response);
          $("#searchLoading").addClass("d-none");
        },
        error: function (xhr) {
          console.error("Search error:", xhr.responseText);
          alert("An error occurred while searching. Please try again.");
          $("#searchLoading").addClass("d-none");
        },
      });
    }

    // Update table with search results
    function updateTable(materials) {
      const tbody = $("#materialTableBody");
      tbody.empty();

      // Check if materials is an array, if not, try to extract the content
      let materialsArray = materials;
      if (!Array.isArray(materials)) {
        console.log("Response is not an array:", materials);
        // Try to extract content from common response formats
        if (materials && materials.content) {
          materialsArray = materials.content;
        } else if (materials && materials.materials) {
          materialsArray = materials.materials;
        } else if (materials && materials.data) {
          materialsArray = materials.data;
        } else {
          // If we can't find an array, create an empty one
          materialsArray = [];
        }
      }

      if (materialsArray.length === 0) {
        tbody.html(`
                      <tr>
                          <td colspan="8" class="text-center py-4">
                              <i class="fas fa-folder-open fa-2x text-muted mb-2"></i>
                              <p class="text-muted">No materials found matching your criteria.</p>
                          </td>
                      </tr>
                  `);
        return;
      }

      materialsArray.forEach((material, index) => {
        const row = `
                      <tr>
                          <td><input type="checkbox" class="selectItem" value="${
                            material.id
                          }" /></td>
                          <td class="align-middle text-center">${
                            index + 1
                          }</td>
                          <td class="align-middle fw-medium" style="text-align: left;">${
                            material.name
                          }</td>
                          <td class="align-middle text-muted small" style="text-align: left;">${
                            material.session ? material.session.name : "N/A"
                          }</td>
                          <td>
                              <span class="badge rounded-pill ${
                                material.type === "PDF"
                                  ? "bg-soft-red"
                                  : material.type === "YOUTUBE"
                                  ? "bg-soft-blue"
                                  : material.type === "TEXT"
                                  ? "bg-soft-green"
                                  : material.type === "VIDEO"
                                  ? "bg-soft-purple"
                                  : material.type === "AUDIO"
                                  ? "bg-soft-orange"
                                  : "bg-secondary"
                              }">${material.type}</span>
                          </td>
                          <td>
                              ${
                                material.fileUrl
                                  ? `<a href="${material.fileUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">View</a>`
                                  : '<span class="text-muted">No file</span>'
                              }
                          </td>
                          <td class="align-middle text-center">${
                            material.estimatedTimeInMinutes || "N/A"
                          }</td>
                          <td class="text-center align-middle">
                              <div class="d-flex justify-content-center gap-2">
                                  <a href="/course-materials/edit/${
                                    material.id
                                  }" class="btn btn-sm btn-outline-secondary" title="Edit">
                                      <i class="fas fa-edit"></i>
                                  </a>
                                  <button type="button" class="btn btn-sm btn-outline-secondary delete-btn"
                                          data-bs-toggle="modal" data-bs-target="#deleteModal"
                                          data-id="${
                                            material.id
                                          }" title="Delete">
                                      <i class="fas fa-trash"></i>
                                  </button>
                              </div>
                          </td>
                      </tr>
                  `;
        tbody.append(row);
      });

      $(".delete-btn")
        .off("click")
        .on("click", function () {
          const materialId = $(this).data("id");
          $("#deleteForm").attr(
            "action",
            `/course-materials/delete/${materialId}`
          );
        });

      const totalRecords = $(".text-muted strong");
      if (totalRecords.length) {
        totalRecords.text(materials.length);
      }
    }

    // Update test view with search results
    function updateTestView(materials) {
      const accordion = $("#ssAccordion");
      accordion.empty();

      // Check if materials is an array, if not, try to extract the content
      let materialsArray = materials;
      if (!Array.isArray(materials)) {
        console.log("Response is not an array:", materials);
        // Try to extract content from common response formats
        if (materials && materials.content) {
          materialsArray = materials.content;
        } else if (materials && materials.materials) {
          materialsArray = materials.materials;
        } else if (materials && materials.data) {
          materialsArray = materials.data;
        } else {
          // If we can't find an array, create an empty one
          materialsArray = [];
        }
      }

      // Group materials by session
      const sessionMap = {};
      materialsArray.forEach((material) => {
        const sessionId = material.session?.id || "no-session";
        if (!sessionMap[sessionId]) {
          sessionMap[sessionId] = {
            name: material.session?.name || "No Session",
            materials: [],
          };
        }
        sessionMap[sessionId].materials.push(material);
      });

      Object.entries(sessionMap).forEach(([sessionId, session], index) => {
        const accordionItem = `
                      <div class="accordion-item">
                          <h2 class="accordion-header">
                              <div class="d-flex align-items-center">
                                  <button class="accordion-button ${
                                    index === 0 ? "" : "collapsed"
                                  } flex-grow-1"
                                          type="button"
                                          data-bs-toggle="collapse"
                                          data-bs-target="#ss${sessionId}">
                                      <span>${session.name}</span>
                                  </button>
                                  <div class="dropdown">
                                      <button type="button"
                                              class="btn btn-sm btn-outline-primary me-2"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false"
                                              title="Add Material">
                                          <i class="bi bi-plus"></i>
                                      </button>
                                      <ul class="dropdown-menu dropdown-menu-end material-options">
                                          <li><a class="dropdown-item" href="javascript:void(0)"><i class="bi bi-youtube text-danger"></i><span>Add YouTube URL</span></a></li>
                                          <li><a class="dropdown-item" href="javascript:void(0)"><i class="bi bi-camera-video text-primary"></i><span>Add Video</span></a></li>
                                          <li><a class="dropdown-item" href="javascript:void(0)"><i class="bi bi-music-note-beamed text-success"></i><span>Add Audio</span></a></li>
                                          <li><a class="dropdown-item" href="javascript:void(0)"><i class="bi bi-file-pdf text-danger"></i><span>Add PDF</span></a></li>
                                          <li><hr class="dropdown-divider"></li>
                                          <li><a class="dropdown-item" href="javascript:void(0)"><i class="bi bi-files text-secondary"></i><span>Add Multiple Types</span></a></li>
                                      </ul>
                                  </div>
                              </div>
                          </h2>
                          <div id="ss${sessionId}"
                              class="accordion-collapse collapse ${
                                index === 0 ? "show" : ""
                              }"
                              data-bs-parent="#ssAccordion">
                              <div class="accordion-body p-0">
                                  <ul class="list-group list-group-flush">
                                      ${session.materials
                                        .map(
                                          (material) => `
                                          <li class="list-group-item d-flex justify-content-between align-items-center material-item"
                                              data-material-id="${material.id}"
                                              data-material-name="${material.name}"
                                              data-material-type="${material.type}"
                                              data-material-url="${material.fileUrl || ''}"
                                              style="cursor: pointer; padding-left: 40px;">
                                              <div class="d-flex align-items-center flex-grow-1" onclick="handleMaterialClick(this)">
                                                  <span class="me-2">${material.name}</span>
                                                  <span class="badge rounded-pill material-type-badge"
                                                        data-type="${material.type}">${material.type}</span>
                                                  <span class="ms-2 text-muted">${material.fileUrl ? material.fileUrl : 'No URL'}</span>
                                              </div>
                                              <div class="d-flex gap-2">
                                                  <button class="btn btn-outline-primary btn-sm"
                                                          onclick="handleMaterialEdit(event, this)"
                                                          data-material-id="${material.id}"
                                                          data-material-name="${material.name}"
                                                          data-material-type="${material.type}"
                                                          data-material-url="${material.fileUrl || ''}"
                                                          data-material-time="${material.estimatedTimeInMinutes || ''}"
                                                          data-material-description="${material.description || ''}">
                                                      <i class="fas fa-edit"></i>
                                                  </button>
                                                  <button class="btn btn-outline-danger btn-sm"
                                                          onclick="handleMaterialDelete(event, this)"
                                                          data-material-id="${material.id}">
                                                      <i class="fas fa-trash"></i>
                                                  </button>
                                              </div>
                                          </li>
                                      `
                                        )
                                        .join("")}
                                  </ul>
                              </div>
                          </div>
                      </div>
                  `;
        accordion.append(accordionItem);
      });

      $(".material-type-badge").each(function () {
        applyBadgeClass($(this), $(this).text().trim());
      });

      $(".material-item")
        .off("click")
        .on("click", function (e) {
          if (!$(e.target).closest(".btn").length) {
            showMaterialContent($(this));
          }
        });
    }

    // Input handlers for real-time search
    $("#nameSearch").on("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => performSearch(0), DEBOUNCE_DELAY);
    });

    $("#sessionSearch, #typeSearch").on("change", function () {
      currentPage = 0;
      performSearch(0);
    });

    $("#timeSearch").on("input", function () {
      if (this.value === "" || this.value >= 0) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(0), DEBOUNCE_DELAY);
      }
    });

    // Form reset handler
    $("#advancedSearchForm").on("reset", function () {
      $("#nameSearch").val("");
      $("#sessionSearch").val("");
      $("#typeSearch").val("");
      $("#timeSearch").val("");
      currentPage = 0;
      performSearch(0);
    });

    // Initialize Select2 for better dropdown experience
    $("#sessionSearch, #typeSearch").select2({
      width: "100%",
      minimumResultsForSearch: Infinity,
    });

    // Handle Select2 change events
    $("#sessionSearch, #typeSearch").on(
      "select2:select select2:unselect",
      function () {
        currentPage = 0;
        performSearch(0);
      }
    );

    // Update pagination with search results
    function updatePagination(response) {
      // Extract pagination data from response
      let totalPages = 0;
      let currentPage = 0;
      let totalItems = 0;

      if (response && typeof response === "object") {
        // Check if response has pagination properties
        if (response.totalPages !== undefined) {
          totalPages = response.totalPages;
          currentPage = response.currentPage || 0;
          totalItems = response.totalItems || 0;
        } else if (response.pageable) {
          // Spring Data JPA format
          totalPages = response.totalPages || 0;
          currentPage = response.number || 0;
          totalItems = response.totalElements || 0;
        }
      }

      // Update pagination controls
      const paginationContainer = $(".pagination");
      if (paginationContainer.length) {
        // Clear existing pagination
        paginationContainer.empty();

        // Add first page button
        paginationContainer.append(`
          <li class="page-item ${currentPage === 0 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="0" aria-label="First">
              <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
          </li>
        `);

        // Add previous page button
        paginationContainer.append(`
          <li class="page-item ${currentPage === 0 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${
              currentPage - 1
            }" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
        `);

        // Add page numbers
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
          paginationContainer.append(`
            <li class="page-item ${i === currentPage ? "active" : ""}">
              <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>
          `);
        }

        // Add next page button
        paginationContainer.append(`
          <li class="page-item ${
            currentPage === totalPages - 1 ? "disabled" : ""
          }">
            <a class="page-link" href="#" data-page="${
              currentPage + 1
            }" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        `);

        // Add last page button
        paginationContainer.append(`
          <li class="page-item ${
            currentPage === totalPages - 1 ? "disabled" : ""
          }">
            <a class="page-link" href="#" data-page="${
              totalPages - 1
            }" aria-label="Last">
              <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
          </li>
        `);

        // Add click event to pagination links
        paginationContainer.find(".page-link").on("click", function (e) {
          e.preventDefault();
          const page = $(this).data("page");
          if (page >= 0 && page < totalPages) {
            currentPage = page;
            performSearch(page);
          }
        });
      }

      // Update total items display
      const totalItemsElement = $(".text-muted strong");
      if (totalItemsElement.length) {
        totalItemsElement.text(totalItems);
      }
    }

    // Thêm sự kiện change cho select type
    $(document).on('change', '.material-type', function() {
        const type = $(this).val();
        const container = $(this).closest('.material-entry').find('.type-specific-fields');
        showTypeSpecificFields(type, container);
    });

    // Handle material edit
    window.handleMaterialEdit = function(event, element) {
      event.stopPropagation(); // Prevent triggering the material click event
      
      const button = $(element);
      const materialId = button.data('material-id');
      const materialName = button.data('material-name');
      const materialType = button.data('material-type');
      const materialUrl = button.data('material-url');
      const materialTime = button.data('material-time');
      const materialDescription = button.data('material-description');

      // Populate the edit modal
      $('#editMaterialId').val(materialId);
      $('#editMaterialName').val(materialName);
      $('#editMaterialType').val(materialType);
      $('#editMaterialUrl').val(materialUrl);
      
      // Show the edit modal
      const editModal = new bootstrap.Modal(document.getElementById('editMaterialModal'));
      editModal.show();
    };

    // Handle form submission
    $('#editMaterialForm').on('submit', function(e) {
      e.preventDefault();
      
      const formData = {
          id: $('#editMaterialId').val(),
          name: $('#editMaterialName').val(),
          type: $('#editMaterialType').val(),
          fileUrl: $('#editMaterialUrl').val()
      };

      $.ajax({
          url: window.location.protocol + '//' + window.location.host + '/course-materials/update',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function(response) {
              const editModal = bootstrap.Modal.getInstance(document.getElementById('editMaterialModal'));
              editModal.hide();
              window.location.reload();
          },
          error: function(xhr) {
              alert('Error updating material: ' + xhr.responseText);
          }
      });
    });

    // Handle material type change in edit form
    $("#editMaterialType").on("change", function () {
      const type = $(this).val();
      const container = $("#editTypeSpecificFields");
      showTypeSpecificFields(type, container);
    });
  });
