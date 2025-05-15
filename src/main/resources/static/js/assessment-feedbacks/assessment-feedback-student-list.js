$(document).ready(function () {
    let currentPage = 0;
    let size = 6; // Number of items per page
    let keyword = '';
    let startItemNumber = 1; // Keep track of the starting item number

    // Load initial data
    loadFeedbacks();

    // Search form submission
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        keyword = $('#keyword').val();
        currentPage = 0;
        startItemNumber = 1;
        loadFeedbacks();
    });

    // Clear search
    $('#clearSearch').on('click', function () {
        $('#keyword').val('');
        keyword = '';
        currentPage = 0;
        startItemNumber = 1;
        loadFeedbacks();
    });

    // Handle pagination click
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        if (!$(this).parent().hasClass('disabled')) {
            const page = $(this).data('page');
            if (page !== undefined) {
                currentPage = page;
                // Calculate the start item number for the new page
                startItemNumber = currentPage * size + 1;
                loadFeedbacks();
            }
        }
    });

    // Handle card expansion/collapse
    $(document).on('click', '.card-header', function () {
        const targetId = $(this).data('target');
        $('.collapse').not(targetId).collapse('hide');
        $(targetId).collapse('toggle');
    });

    function loadFeedbacks() {
        $('#loading-spinner').show();

        $.ajax({
            url: '/assessment_feedbacks/student/ajax',
            type: 'GET',
            data: {
                page: currentPage,
                size: size,
                keyword: keyword
            },
            success: function (response) {
                console.log('Feedbacks loaded successfully:', response);
                renderFeedbacks(response);
                renderPagination(response);
                $('#loading-spinner').hide();
            },
            error: function (error) {
                console.error('Error loading feedbacks:', error);
                $('#feedbackContainer').html('<div class="alert alert-danger">Error loading feedbacks. Please try again later.</div>');
                $('#loading-spinner').hide();
            }
        });
    }

    function renderFeedbacks(response) {
        const feedbacks = response.content;
        const totalItems = response.totalElements;

        if (feedbacks.length === 0) {
            // No feedbacks found
            let noFeedbackHtml = `
                    <div class="no-feedback-card">
                        <i class="far fa-comment-dots fa-4x mb-4 text-muted"></i>
                        <h4 class="text-muted mb-3">No feedbacks found</h4>
                        <p class="text-muted">${keyword ? 'No results match your search criteria. Try different keywords.' : 'You haven\'t submitted any feedback yet.'}</p>
                    </div>
                `;
            $('#feedbackContainer').html(noFeedbackHtml);
            return;
        }

        // Generate feedback cards
        let html = '<div class="row">';

        $.each(feedbacks, function (index, feedback) {
            const itemNumber = startItemNumber + index;
            const stars = generateStars(feedback.rating);
            const submittedDate = formatDate(feedback.submittedOn);
            const submittedDateTime = formatDateTime(feedback.submittedOn);

            html += `
                <div class="col-md-6 mb-4">
                    <div class="assessment-card card">
                        <div class="card-number">${itemNumber}</div>
                        <div class="card-header d-flex justify-content-between align-items-center"
                             id="heading-${feedback.id}" data-toggle="collapse"
                             data-target="#collapse-${feedback.id}" aria-expanded="false"
                             aria-controls="collapse-${feedback.id}">
                            <div>
                                <h5 class="mb-0">${feedback.assessment.title}</h5>
                                <div class="rating-stars">
                                    ${stars}
                                    <span class="ml-2">${feedback.rating}</span>
                                </div>
                            </div>
                            <div class="feedback-date">
                                <span>${submittedDate}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>

                        <div id="collapse-${feedback.id}" class="collapse"
                             aria-labelledby="heading-${feedback.id}">
                            <div class="card-body">
                                <div class="feedback-content">
                                    <h6>Your Feedback:</h6>
                                    <p>${feedback.comment}</p>
                                    <div class="text-muted small">
                                        Submitted on: <span>${submittedDateTime}</span>
                                    </div>
                                </div>`;

            if (feedback.adminReply) {
                const replyDate = feedback.replyDate ? formatDateTime(feedback.replyDate) : '';
                html += `
                                <div class="admin-reply">
                                    <h6>Admin Response:</h6>
                                    <p>${feedback.adminReply}</p>
                                    ${replyDate ? `<div class="text-muted small">Replied on: <span>${replyDate}</span></div>` : ''}
                                </div>`;
            } else {
                html += `
                                <div class="waiting-response">
                                    <i class="far fa-clock"></i>
                                    <span>Waiting for admin response...</span>
                                </div>`;
            }

            html += `
                                <div class="mt-3 text-right">
                                    <a href="/assessments/${feedback.assessment.id}" class="btn view-btn">
                                        <i class="fas fa-eye mr-1"></i> View Assessment
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        html += '</div>';
        $('#feedbackContainer').html(html);
    }

    function renderPagination(response) {
        const totalPages = response.totalPages;
        if (totalPages <= 1) {
            $('#paginationContainer').html('');
            return;
        }

        let html = `
            <nav aria-label="Page navigation">
                <ul class="pagination">
                    <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="0" aria-label="First">
                            <span aria-hidden="true">&laquo;&laquo;</span>
                        </a>
                    </li>
                    <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>`;

        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                    </li>`;
        }

        html += `
                    <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                    <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${totalPages - 1}" aria-label="Last">
                            <span aria-hidden="true">&raquo;&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>`;

        $('#paginationContainer').html(html);
    }

    function generateStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i> ';
        }

        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i> ';
        }

        return starsHtml;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
