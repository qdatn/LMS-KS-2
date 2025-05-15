// script.js
// Biến assessmentId sẽ được truyền từ HTML hoặc thông qua cách khác (ví dụ: data attribute)
const assessmentId = document.getElementById('assessment-id').value; // Giả sử bạn thêm input hidden

$(document).ready(function () {
    let currentPage = 0;
    let totalPages = 0;
    let currentSort = "newest";

    loadFeedbacks(currentPage);

    // Character count for feedback
    $("#comment").on("input", function () {
        const maxLength = 100;
        const currentLength = $(this).val().length;
        const remaining = maxLength - currentLength;
        $("#charCount").text(remaining);

        if (remaining <= 20) {
            $("#charCount").addClass("text-danger");
        } else {
            $("#charCount").removeClass("text-danger");
        }
    });

    // Set up star rating
    $(".star-rating input").on("click", function () {
        const rating = $(this).val();
        $("#rating").val(rating);
        const ratingTexts = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
        $(".rating-text").text(ratingTexts[rating - 1]);
    });

    $("#feedbackForm").submit(function (e) {
        e.preventDefault();
        addFeedback();
    });

    $("#prevPage").click(function (e) {
        e.preventDefault();
        if (currentPage > 0) {
            loadFeedbacks(currentPage - 1);
        }
    });

    $("#nextPage").click(function (e) {
        e.preventDefault();
        if (currentPage < totalPages - 1) {
            loadFeedbacks(currentPage + 1);
        }
    });

    // Handle sort change
    $("#sortOption").change(function () {
        currentSort = $(this).val();
        currentPage = 0; // Reset to first page when sorting changes
        loadFeedbacks(currentPage);
    });
});

function loadFeedbacks(page) {
    console.log(
        "Loading feedbacks for assessment ID: ",
        assessmentId,
        "page:",
        page
    );
    $.ajax({
        url: "/assessment_feedbacks/api/feedbacks/" + assessmentId,
        method: "GET",
        data: {
            page: page,
            sort: $("#sortOption").val(),
        },
        success: function (response) {
            console.log("response load feedback: ", response);
            const data = response.feedbacks;
            console.log("data: ", data);
            currentPage = response.currentPage;
            totalPages = response.totalPages;
            const hasSubmittedFeedback = response.hasSubmittedFeedback;

            // Update average rating and total feedbacks
            $("#averageRating").text(response.averageRating.toFixed(1));
            $("#totalFeedbacks").text(response.totalItems);

            // Show/hide feedback form based on whether user has already submitted feedback
            if (hasSubmittedFeedback) {
                $("#feedbackForm").parent().html(
                    '<div class="alert alert-info mb-0">' +
                    '<i class="bi bi-info-circle me-2"></i>' +
                    'You have already submitted feedback for this assessment. ' +
                    'You can edit or delete your feedback below if needed.' +
                    '</div>'
                );
            }

            updatePaginationControls();

            if (data.length === 0) {
                $("#feedbackList").html(
                    '<div class="text-center py-4 text-muted">No feedback submitted yet. Be the first to share your thoughts!</div>'
                );
                return;
            }

            let html = "";
            data.forEach((feedback) => {
                let stars = "";
                for (let i = 1; i <= 5; i++) {
                    if (i <= feedback.rating) {
                        stars += '<i class="bi bi-star-fill filled me-1"></i>';
                    } else {
                        stars += '<i class="bi bi-star empty me-1"></i>';
                    }
                }

                const submittedDate = new Date(feedback.submittedOn);
                const formattedDate = submittedDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                html += `
          <div class="feedback-item border rounded p-3 mb-3 ${
                    feedback.adminReply ? "admin-replied" : ""
                }" data-id="${feedback.id}">
            <div class="d-flex justify-content-between mb-2">
              <div>
                <span class="fw-bold">${
                    feedback.user.username
                }</span>
                <span class="feedback-meta ms-2">
                  <i class="bi bi-clock me-1"></i>${formattedDate}
                </span>
              </div>
              <div class="feedback-rating">
                ${stars}
                <span class="ms-1">(${feedback.rating}/5)</span>
              </div>
            </div>

            <div class="feedback-comment mb-3">
              ${feedback.comment}
            </div>

            ${
                    feedback.adminReply
                        ? `
              <div class="admin-reply mt-3 p-2">
                <div class="fw-bold text-success mb-1">
                  <i class="bi bi-person-badge me-1"></i>Admin Reply:
                </div>
                <div>${feedback.adminReply}</div>
                <div class="feedback-meta mt-1">
                  <i class="bi bi-clock me-1"></i>${new Date(
                            feedback.replyDate
                        ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                </div>
              </div>
            `
                        : ""
                }

            ${
                    feedback.isOwnFeedback
                        ? `
              <div class="feedback-actions mt-3 text-end">
                <button class="btn btn-sm btn-outline-secondary edit-feedback">
                  <i class="bi bi-pencil me-1"></i>Edit
                </button>
                <button class="btn btn-sm btn-outline-secondary delete-feedback">
                  <i class="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            `
                        : ""
                }
          </div>
        `;
            });

            $("#feedbackList").html(html);
        },
        error: function (xhr, status, error) {
            console.error("Error loading feedbacks:", error);
            $("#feedbackList").html(
                '<div class="alert alert-danger">Error loading feedbacks. Please try again later.</div>'
            );
        },
    });
}

function updatePaginationControls() {
    $("#prevPage").toggleClass("disabled", currentPage === 0);
    $("#nextPage").toggleClass("disabled", currentPage === totalPages - 1);

    // Remove existing page numbers first
    $(".pagination .page-item:not(#prevPage):not(#nextPage)").remove();

    // Update page numbers
    let paginationHtml = "";
    for (let i = 0; i < totalPages; i++) {
        paginationHtml += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
      </li>
    `;
    }

    // Insert page numbers between prev and next buttons
    $("#nextPage").before(paginationHtml);

    // Add click handlers for page numbers
    $(".page-link[data-page]").click(function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        loadFeedbacks(page);
    });
}

function addFeedback() {
    const feedbackData = {
        rating: $("#rating").val(),
        comment: $("#comment").val(),
        assessmentId: assessmentId,
    };

    if (!feedbackData.rating) {
        alert("Please select a rating");
        return;
    }

    $("#feedbackForm button")
        .prop("disabled", true)
        .html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...'
        );

    $.ajax({
        url: "/assessment_feedbacks/api/feedbacks",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(feedbackData),
        success: function () {
            const successAlert = $(
                '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                "Your feedback has been submitted successfully!" +
                '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                "</div>"
            );

            $("#feedbackForm").before(successAlert);
            setTimeout(function () {
                successAlert.alert("close");
            }, 3000);

            $("#feedbackForm")[0].reset();
            $(".rating-text").text("");
            $(".star-rating input").prop("checked", false);
            $("#rating").val("");
            loadFeedbacks();
        },
        error: function () {
            $("#feedbackForm").before(
                '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                "Failed to submit feedback. Please try again." +
                '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
                "</div>"
            );
        },
        complete: function () {
            $("#feedbackForm button")
                .prop("disabled", false)
                .html('<i class="bi bi-send me-1"></i> Submit Feedback');
        },
    });
}

$(document).on("click", ".edit-feedback", function () {
    const feedbackItem = $(this).closest(".feedback-item");
    const id = feedbackItem.data("id");
    const currentComment = feedbackItem
        .find(".feedback-comment")
        .text()
        .trim();
    const currentRating = parseInt(
        feedbackItem
            .find(".feedback-rating span")
            .text()
            .replace(/[()\/5]/g, "")
    );

    const modalHTML = `
    <div class="modal fade" id="editFeedbackModal" tabindex="-1" aria-labelledby="editFeedbackModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editFeedbackModalLabel">Edit Feedback</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editFeedbackForm">
              <div class="form-group mb-3">
                <label class="fw-bold">Rating:</label>
                <div class="d-flex mt-2">
                  <select class="form-select" id="editRating">
                    <option value="1" ${currentRating === 1 ? "selected" : ""}>1 - Poor</option>
                    <option value="2" ${currentRating === 2 ? "selected" : ""}>2 - Fair</option>
                    <option value="3" ${currentRating === 3 ? "selected" : ""}>3 - Good</option>
                    <option value="4" ${currentRating === 4 ? "selected" : ""}>4 - Very Good</option>
                    <option value="5" ${currentRating === 5 ? "selected" : ""}>5 - Excellent</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="fw-bold">Comment:</label>
                <textarea class="form-control mt-2" id="editComment" rows="4" required>${currentComment}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveFeedbackEdit" data-id="${id}">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

    $("body").append(modalHTML);
    const modal = new bootstrap.Modal(
        document.getElementById("editFeedbackModal")
    );

    modal.show();
    $("#editFeedbackModal").on("shown.bs.modal", function () {
        $("#saveFeedbackEdit").focus();
    });

    $("#saveFeedbackEdit").on("click", function () {
        const id = $(this).data("id");
        const editedRating = $("#editRating").val();
        const editedComment = $("#editComment").val();

        if (!editedComment.trim()) {
            alert("Comment cannot be empty");
            return;
        }

        $.ajax({
            url: "/assessment_feedbacks/api/feedbacks/" + id,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                rating: editedRating,
                comment: editedComment,
            }),
            success: function () {
                modal.hide();
                $("#editFeedbackModal").on("hidden.bs.modal", function () {
                    $(this).remove();

                    const toastHTML = `
            <div class="position-fixed top-0 end-0 p-3" style="z-index: 1050">
              <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                  <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>Feedback updated successfully!
                  </div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
              </div>
            </div>
          `;

                    $("body").append(toastHTML);
                    const toastEl = document.querySelector(".toast");
                    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
                    toast.show();
                    $(toastEl).on("hidden.bs.toast", function () {
                        $(this).parent().remove();
                    });

                    loadFeedbacks();
                });
            },
            error: function () {
                alert("Failed to update feedback. Please try again.");
            },
        });
    });

    $("#editFeedbackModal").on("hidden.bs.modal", function () {
        $(this).remove();
        // Chuyển focus về nút Edit ban đầu
        $('.edit-feedback[data-id="' + id + '"]').focus();
    });
});

$(document).on("click", ".delete-feedback", function () {
    const feedbackItem = $(this).closest(".feedback-item");
    const id = feedbackItem.data("id");

    const modalHTML = `
    <div class="modal fade" id="deleteFeedbackModal" tabindex="-1" aria-labelledby="deleteFeedbackModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteFeedbackModalLabel">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDelete" data-id="${id}">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

    $("body").append(modalHTML);
    const modal = new bootstrap.Modal(
        document.getElementById("deleteFeedbackModal")
    );

    modal.show();
    $("#deleteFeedbackModal").on("shown.bs.modal", function () {
        $("#confirmDelete").focus();
    });

    $("#confirmDelete").on("click", function () {
        const id = $(this).data("id");

        $.ajax({
            url: "/assessment_feedbacks/api/feedbacks/" + id,
            method: "DELETE",
            success: function () {
                modal.hide();
                $("#deleteFeedbackModal").on("hidden.bs.modal", function () {
                    $(this).remove();

                    const toastHTML = `
            <div class="position-fixed top-0 end-0 p-3" style="z-index: 1050">
              <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                  <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>Feedback deleted successfully!
                  </div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
              </div>
            </div>
          `;

                    $("body").append(toastHTML);
                    const toastEl = document.querySelector(".toast");
                    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
                    toast.show();
                    $(toastEl).on("hidden.bs.toast", function () {
                        $(this).parent().remove();
                    });

                    loadFeedbacks();
                });
            },
            error: function () {
                alert("Failed to delete feedback. Please try again.");
            },
        });
    });

    $("#deleteFeedbackModal").on("hidden.bs.modal", function () {
        $(this).remove();
        $('.delete-feedback[data-id="' + id + '"]').focus();
    });
});