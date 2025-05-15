function loadAssessments() {
    var courseId = $("#courseId").val();
    var assessmentSelect = $("#assessmentId");

    console.log("Course ID selected: ", courseId);
    // Disable Assessment dropdown nếu chưa chọn Course
    if (!courseId) {
        assessmentSelect.prop("disabled", true);
        assessmentSelect.html('<option value="">Select an Assessment</option>');
        return;
    }

    // Enable Assessment dropdown và load danh sách Assessment
    assessmentSelect.prop("disabled", false);
    $.ajax({
        url: "/assessment_feedbacks/admin/assessments-by-course", // API endpoint để lấy danh sách Assessment
        type: "GET", data: {courseId: courseId}, success: function (response) {
            console.log("Assessments loaded: ", response);
            assessmentSelect.html('<option value="">Select an Assessment</option>');
            response.forEach(function (assessment) {
                assessmentSelect.append('<option value="' + assessment.id + '">' + assessment.title + "</option>");
            });
        }, error: function () {
            console.error("Error loading assessments: ", error);
            assessmentSelect.html('<option value="">Error loading assessments</option>');
        },
    });
}

// Khởi tạo trạng thái ban đầu
$(document).ready(function () {
    loadAssessments(); // Gọi khi trang load để kiểm tra giá trị courseId ban đầu
});

document.addEventListener("DOMContentLoaded", function () {
    // Initialize date pickers
    if (typeof flatpickr === 'function') {
        // Chỉ khởi tạo flatpickr cho các input có class flatpickr-date
        flatpickr(".flatpickr-date", {
            dateFormat: "Y-m-d",
            allowInput: true
        });
    }

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Load initial data
    fetchFeedbacks();

    // Add event listeners for form changes
    const form = document.getElementById("searchForm");
    const selectElements = form.querySelectorAll("select");
    selectElements.forEach((select) => {
        select.addEventListener("change", function () {
            fetchFeedbacks();
        });
    });

    // Add event listener for input fields with debounce
    const inputFields = form.querySelectorAll('input[type="text"], input[type="date"]');
    inputFields.forEach((input) => {
        input.addEventListener("input", debounce(function () {
            fetchFeedbacks();
        }, 300));
    });

    // Initialize chart
    initializeChart();

    // Set default date range (last 30 days to today)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Hàm định dạng ngày thành YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Gán giá trị cho input
    const startDateInput = document.getElementById('chartStartDate');
    const endDateInput = document.getElementById('chartEndDate');
    if (startDateInput && endDateInput) {
        startDateInput.value = formatDate(thirtyDaysAgo);
        endDateInput.value = formatDate(today);
    } else {
        console.error('Date inputs not found in DOM');
    }

    // Load chart data initially
    fetchChartData();
});

// chart assessment feedback
let feedbackChart = null;

function initializeChart() {
    const ctx = document.getElementById('feedbackRatingChart').getContext('2d');
    feedbackChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Rating',
                data: [],
                backgroundColor: [], // Sẽ được cập nhật động
                borderColor: [], // Sẽ được cập nhật động
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Average Rating (0-5)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Average Rating: ${context.raw.y.toFixed(2)} (${context.raw.feedbackCount} feedbacks)`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Course Feedback Ratings'
                },
                // Plugin to display feedback count on top of each bar
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function (value, context) {
                        return `${context.dataset.data[context.dataIndex].feedbackCount}`;
                    },
                    font: {
                        weight: 'bold'
                    },
                    color: '#000'
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function fetchChartData() {
    const startDate = document.getElementById('chartStartDate').value;
    const endDate = document.getElementById('chartEndDate').value;

    // Show loading message or spinner
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading chart data...</p></div>';

    // Re-create canvas
    chartContainer.innerHTML += '<canvas id="feedbackRatingChart"></canvas>';

    fetch(`/assessment_feedbacks/admin/chart-data?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove spinner
            chartContainer.querySelector('.text-center')?.remove();
            // Initialize chart again since we re-created the canvas
            initializeChart();
            // Update chart with data
            updateChartWithData(data);
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
            chartContainer.innerHTML = '<div class="alert alert-danger">Error loading chart data. Please try again.</div>';
        });
}

function updateChartWithData(data) {
    if (!feedbackChart) {
        return;
    }

    // Check if we have data
    if (data.courses.length === 0) {
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.innerHTML = '<div class="alert alert-info">No feedback data available for the selected period.</div>';
        return;
    }

    // Update chart title with date range
    const startDate = document.getElementById('chartStartDate').value;
    const endDate = document.getElementById('chartEndDate').value;
    feedbackChart.options.plugins.title.text = `Assessment Feedback Ratings of the 10 most recently submitted courses  (${startDate} to ${endDate})`;

    // Format data for chart
    const chartData = data.courses.map((course, index) => {
        return {
            x: course.name.length > 20 ? course.name.substring(0, 17) + '...' : course.name,
            y: data.averageRatings[index],
            feedbackCount: data.feedbackCounts[index]
        };
    });

    // Update chart data
    feedbackChart.data.labels = chartData.map(item => item.x);
    feedbackChart.data.datasets[0].data = chartData;

    // Cập nhật màu sắc dựa trên rating
    feedbackChart.data.datasets[0].backgroundColor = data.averageRatings.map(rating => {
        if (rating < 3.5) return 'rgba(255, 0, 0, 0.7)'; // Đỏ cho rating < 3.5
        if (rating < 4) return 'rgba(255, 165, 0, 0.7)'; // Vàng cho rating 3-4
        return 'rgba(54, 162, 235, 0.7)'; // Xanh lam cho rating >= 4
    });
    feedbackChart.data.datasets[0].borderColor = data.averageRatings.map(rating => {
        if (rating < 3) return 'rgba(255, 0, 0, 1)'; // Đỏ đậm cho rating < 3
        if (rating < 4) return 'rgba(255, 165, 0, 1)'; // Vàng đậm cho rating 3-4
        return 'rgba(54, 162, 235, 1)'; // Xanh lam đậm cho rating >= 4
    });

    feedbackChart.update();
}

function updateChart() {
    fetchChartData();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function fetchFeedbacks(page = 0) {
    const form = document.getElementById("searchForm");
    const formData = new FormData(form);
    const params = new URLSearchParams();

    // Add all form fields to params
    for (const [key, value] of formData.entries()) {
        if (value) {
            // Only add non-empty values
            params.append(key, value);
        }
    }

    // Add pagination parameters
    params.set("page", page);
    params.set("size", 10);

    fetch(`/assessment_feedbacks/admin/api?${params.toString()}`, {
        method: "GET", headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Feedbacks assessment feedback data:", data);
            renderFeedbacks(data.feedbacks);
            renderPagination(data.currentPage, data.totalPages, data.totalItems);
        })
        .catch((error) => console.error("Error fetching feedbacks:", error));
}

function renderFeedbacks(feedbacks) {
    const tbody = document.getElementById("feedbackTableBody");
    tbody.innerHTML = "";

    if (feedbacks.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-5">
                            <div class="py-4">
                                <i class="bi bi-inbox-fill fs-1 text-muted d-block mb-3"></i>
                                <h5 class="text-muted mb-2">No feedbacks found</h5>
                                <p class="text-muted mb-4">Try adjusting your search or filter criteria</p>
                            </div>
                        </td>
                    </tr>
                `;
        return;
    }

    feedbacks.forEach((feedback, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td class="ps-3">${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                                 style="width: 32px; height: 32px;">
                                <span>${feedback.user.lastName
            .substring(0, 2)
            .toUpperCase()}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark">${feedback.assessment.title}</span>
                    </td>
                    <td>
                        <div class="text-warning">
                            ${Array(Math.floor(feedback.rating))
            .fill('<i class="bi bi-star-fill"></i>')
            .join("")}
                            ${feedback.rating % 1 !== 0 ? '<i class="bi bi-star-half"></i>' : ""}
                            <small class="text-muted ms-1">${feedback.rating}</small>
                        </div>
                    </td>
                    <td style="max-width: 300px;">
                        <p class="text-truncate mb-0" data-bs-toggle="tooltip" title="${feedback.comment}">${feedback.comment}</p>
                    </td>
                    <td>
                        <div class="d-flex flex-column">
                            <span>${new Date(feedback.submittedOn).toLocaleDateString("en-US", {
            day: "2-digit", month: "short", year: "numeric",
        })}</span>
                            <small class="text-muted">${new Date(feedback.submittedOn).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
        })}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${feedback.adminReply ? "bg-success" : "bg-warning text-dark"}">
                            ${feedback.adminReply ? "Replied" : "Pending"}
                        </span>
                    </td>
                    <td class="text-end pe-3">
                        <div class="btn-group">
                            <a href="/assessment_feedbacks/admin/${feedback.id}" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-eye"></i> View
                            </a>
                        </div>
                    </td>
                `;
        tbody.appendChild(row);
    });

    // Reinitialize tooltips for new content
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function renderPagination(currentPage, totalPages, totalItems) {
    const paginationSection = document.getElementById("paginationSection");
    if (totalPages <= 0) {
        paginationSection.innerHTML = "";
        return;
    }

    const start = currentPage * 10 + 1;
    const end = Math.min(start + 9, totalItems);

    // Create pagination with limited visible pages
    let paginationHTML = `
        <div>
            <span class="text-muted">Showing ${start} to ${end} of ${totalItems} entries</span>
        </div>
        <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
                <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="fetchFeedbacks(0); return false;">
                        <i class="bi bi-chevron-double-left"></i>
                    </a>
                </li>
                <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="fetchFeedbacks(${currentPage - 1}); return false;">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>`;

    // Logic for showing limited page numbers (similar to Image 2)
    const maxVisiblePages = 3;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="fetchFeedbacks(${i}); return false;">${i + 1}</a>
            </li>`;
    }

    paginationHTML += `
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="fetchFeedbacks(${currentPage + 1}); return false;">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
                <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="fetchFeedbacks(${totalPages - 1}); return false;">
                        <i class="bi bi-chevron-double-right"></i>
                    </a>
                </li>
            </ul>
        </nav>`;

    paginationSection.innerHTML = paginationHTML;
}

function printAssessmentFeedbacks() {
    var printContent = document
        .getElementById("assessmentFeedbacksTable")
        .cloneNode(true);

    var headers = printContent.querySelectorAll("thead th");
    var cells = printContent.querySelectorAll("tbody td");

    if (headers.length >= 8) headers[7].remove();

    cells.forEach(function (cell, index) {
        if ((index + 1) % 8 === 0) cell.remove();
    });

    var originalContent = document.body.innerHTML;

    var printContainer = document.createElement("div");
    printContainer.style.padding = "20px";
    printContainer.style.fontFamily = "Arial, sans-serif";

    var title = document.createElement("div");
    title.innerHTML = "<h1 style='text-align: center; color: #2c3e50; margin-bottom: 20px;'>Assessment Feedbacks Report</h1>";
    title.innerHTML += "<div style='text-align: center; margin-bottom: 30px; color: #7f8c8d;'>Print date: " + new Date().toLocaleDateString() + "</div>";

    var tableStyle = document.createElement("style");
    tableStyle.textContent = `
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background-color: #3498db; color: white; padding: 12px; text-align: left; font-weight: bold; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                tr:hover { background-color: #e5e5e5; }
                @media print {
                    body { -webkit-print-color-adjust: exact; color-adjust: exact; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
            `;

    var footer = document.createElement("div");
    footer.innerHTML = "<div style='text-align: center; margin-top: 30px; font-size: 12px; color: #7f8c8d; border-top: 1px solid #ddd; padding-top: 10px;'>© " + new Date().getFullYear() + " - Reports are automatically generated from the system.</div>";

    printContainer.appendChild(title);
    printContainer.appendChild(tableStyle);
    printContainer.appendChild(printContent);
    printContainer.appendChild(footer);

    document.body.innerHTML = printContainer.outerHTML;

    setTimeout(function () {
        window.print();
        document.body.innerHTML = originalContent;
        location.reload();
    }, 200);
}