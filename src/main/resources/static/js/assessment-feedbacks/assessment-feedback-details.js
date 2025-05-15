let feedbackId = window.location.pathname.split("/").pop();
document.getElementById("feedbackId").textContent = feedbackId;

function loadFeedbackDetails() {
    fetch(`/assessment_feedbacks/admin/api/${feedbackId}`)
        .then((response) => response.json())
        .then((data) => {
            const feedback = data.feedback;

            // Update feedback details section
            document.getElementById("feedbackDetails").innerHTML = `
                        <div class="mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <div class="text-warning me-2">
                                    ${Array(Math.floor(feedback.rating))
                .fill('<i class="bi bi-star-fill"></i>')
                .join("")}
                                    ${
                feedback.rating % 1 !== 0
                    ? '<i class="bi bi-star-half"></i>'
                    : ""
            }
                                </div>
                                <span class="fw-bold">${feedback.rating}</span>
                                <span class="text-muted ms-3">${new Date(
                feedback.submittedOn
            ).toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}</span>
                            </div>
                            <div class="bg-light p-3 rounded">
                                <p class="mb-0">${feedback.comment}</p>
                            </div>
                        </div>
                        ${
                feedback.adminReply
                    ? `
                            <div class="mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h6 class="text-primary mb-0">
                                        <i class="bi bi-reply-fill"></i> Admin Reply
                                        <small class="text-muted">${new Date(
                        feedback.replyDate
                    ).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</small>
                                    </h6>
                                    <div class="d-flex justify-content-end gap-2 flex-wrap">
                                        <button class="btn btn-sm btn-outline-secondary" onclick="toggleEditReply()" title="Edit Reply">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#deleteReplyModal" title="Delete Reply">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="replyDisplay" class="bg-primary bg-opacity-10 p-3 rounded">
                                    <p class="mb-0">${feedback.adminReply}</p>
                                </div>
                                <div id="replyEditForm" class="mt-3" style="display: none;">
                                    <form onsubmit="submitEditReply(event)">
                                        <div class="mb-3">
                                            <textarea class="form-control" name="editedReply" rows="4" required>${
                        feedback.adminReply
                    }</textarea>
                                        </div>
                                        <div class="d-flex gap-2">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="bi bi-save"></i> Save Changes
                                            </button>
                                            <button type="button" class="btn btn-outline-secondary" onclick="toggleEditReply()">
                                                <i class="bi bi-x"></i> Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        `
                    : `
                            <h6 class="text-primary mb-2">
                                <i class="bi bi-reply-fill"></i> Add Reply
                            </h6>
                            <form onsubmit="submitReply(event)">
                                <div class="mb-3">
                                    <textarea class="form-control" name="reply" rows="4" placeholder="Type your reply here..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-send"></i> Send Reply
                                </button>
                            </form>
                        `
            }
                    `;

            // Update assessment info section
            document.getElementById("assessmentInfo").innerHTML = `
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-light rounded-circle p-3 me-3">
                                <i class="bi bi-file-earmark-text fs-4"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">${feedback.assessment.title}</h6>
                                <span class="text-muted small">ID: <span class="fw-bold">${feedback.assessment.id}</span></span><br>
                                <span class="text-muted small">Duration: <span class="fw-bold">${feedback.assessment.timeLimit}</span> minutes</span><br>
                                <span class="text-muted small">Total Feedbacks: <span class="fw-bold">${data.totalFeedbacksByAssessment}</span></span>
                            </div>
                        </div>
                        <a href="/assessments/${feedback.assessment.id}" class="btn btn-sm btn-outline-secondary w-100">
                            <i class="bi bi-eye"></i> View Assessment
                        </a>
                    `;

            // Update feedback status section
            document.getElementById("feedbackStatus").innerHTML = `
                        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                            <span class="text-muted">Status:</span>
                            <span class="badge ${
                feedback.adminReply
                    ? "bg-success"
                    : "bg-warning text-dark"
            }">
                                ${feedback.adminReply ? "Replied" : "Pending"}
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                            <span class="text-muted">Submission Date:</span>
                            <span>${new Date(
                feedback.submittedOn
            ).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}</span>
                        </div>
                        ${
                feedback.adminReply
                    ? `
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-muted">Reply Date:</span>
                                <span>${new Date(
                        feedback.replyDate
                    ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}</span>
                            </div>
                        `
                    : ""
            }
                    `;
        })
        .catch((error) => {
            console.error("Error loading feedback details:", error);
            document.getElementById("feedbackDetails").innerHTML = `
                        <div class="alert alert-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Failed to load feedback details. Please try again.
                        </div>
                    `;
        });
}

function submitReply(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch(`/assessment_feedbacks/admin/api/${feedbackId}/reply`, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            showAlert(data.success ? "success" : "danger", data.message);
            if (data.success) loadFeedbackDetails();
        })
        .catch((error) => {
            console.error("Error submitting reply:", error);
            showAlert("danger", "Failed to submit reply. Please try again.");
        });
}

function submitEditReply(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch(`/assessment_feedbacks/admin/api/${feedbackId}/edit-reply`, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            showAlert(data.success ? "success" : "danger", data.message);
            if (data.success) loadFeedbackDetails();
        })
        .catch((error) => {
            console.error("Error updating reply:", error);
            showAlert("danger", "Failed to update reply. Please try again.");
        });
}

function deleteReply() {
    fetch(`/assessment_feedbacks/admin/api/${feedbackId}/reply`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((data) => {
            showAlert(data.success ? "success" : "danger", data.message);
            if (data.success) loadFeedbackDetails();
        })
        .catch((error) => {
            console.error("Error deleting reply:", error);
            showAlert("danger", "Failed to delete reply. Please try again.");
        });
    document.querySelector("#deleteReplyModal .btn-close").click(); // Close modal
}

function toggleEditReply() {
    const displayElement = document.getElementById("replyDisplay");
    const editFormElement = document.getElementById("replyEditForm");
    displayElement.style.display =
        displayElement.style.display === "none" ? "block" : "none";
    editFormElement.style.display =
        editFormElement.style.display === "none" ? "block" : "none";
}

function showAlert(type, message) {
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    <i class="bi ${
        type === "success"
            ? "bi-check-circle"
            : "bi-exclamation-triangle"
    } me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
    setTimeout(() => (alertContainer.innerHTML = ""), 5000);
}

document.addEventListener("DOMContentLoaded", loadFeedbackDetails);
