let certificateChart = null; // Biến toàn cục để lưu biểu đồ

document.addEventListener("DOMContentLoaded", function () {
    const userSearch = document.getElementById("userSearch");
    const userIdInput = document.getElementById("userId");
    const filterUserId = document.getElementById("filterUserId");
    const filterForm = document.getElementById("filterForm");
    const resetFilters = document.getElementById("resetFilters");
    const userOptions = document.querySelectorAll("#userList option");
    const exportButton = document.getElementById("exportButton");

    // Mapping user name và ID
    const userMap = {};
    const idToUserMap = {};
    userOptions.forEach((option) => {
        const userName = option.value;
        const userId = option.getAttribute("data-id");
        userMap[userName] = userId;
        idToUserMap[userId] = userName;
    });

    // Khởi tạo giá trị ban đầu
    // userSearch.value = "-- All Users --";
    fetchAchievements();

    // Xử lý khi chọn user
    userSearch.addEventListener("change", function () {
        const selectedText = this.value;
        const selectedId = userMap[selectedText] || "";
        userIdInput.value = selectedId;
        filterUserId.value = selectedId;
        fetchAchievements(); // Gọi ngay khi chọn user

        // Update export button URL
        if (selectedId) {
            exportButton.href = `/achievements/export?userId=${selectedId}`;
        } else {
            exportButton.href = "/achievements/export";
        }
    });

    // Xử lý thay đổi trong các trường filter
    const filterInputs = filterForm.querySelectorAll("input, select");
    filterInputs.forEach((input) => {
        input.addEventListener("change", function () {
            fetchAchievements(); // Gọi ngay khi thay đổi bất kỳ filter nào
        });
        if (input.tagName === "INPUT" && input.type === "text") {
            input.addEventListener("input", debounce(function () {
                fetchAchievements(); // Gọi khi người dùng gõ (có debounce)
            }, 300));
        }
    });

    // Reset filters
    resetFilters.addEventListener("click", function () {
        filterForm.reset();
        fetchAchievements();
    });

    // Hàm debounce để giới hạn tần suất gọi Ajax khi gõ
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Hàm fetch dữ liệu bằng Ajax
    function fetchAchievements(page = 1) {
        const params = new URLSearchParams(new FormData(filterForm));
        params.set("page", page);
        params.set("size", 10);

        fetch(`/achievements/api?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched data achievements:", data);
                renderAchievements(data.achievements);
                renderStatistics(data.statistics);
                renderPagination(data.currentPage, data.totalPages, data.totalItems);
            })
            .catch((error) => console.error("Error fetching achievements:", error));
    }

    // Render danh sách achievements
    function renderAchievements(achievements) {
        const achievementList = document.getElementById("achievementList");
        const noAchievements = document.getElementById("noAchievements");
        achievementList.innerHTML = "";

        if (achievements.length === 0) {
            noAchievements.style.display = "block";
            return;
        }

        noAchievements.style.display = "none";
        const row = document.createElement("div");
        row.className = "row row-cols-1 row-cols-md-3 g-4";
        achievements.forEach((achievement) => {
            const col = document.createElement("div");
            col.className = "col";
            col.innerHTML = `
            <div class="card h-100 shadow-sm rounded">
              <div class="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-semibold text-truncate" title="${achievement.course.name}">${achievement.course.name}</h5>
                <span class="badge ${achievement.certified ? "bg-success" : "bg-secondary"} rounded-pill px-3 py-2">
                  ${achievement.certified ? '<i class="fas fa-certificate me-1"></i>Certified' : "Not Certified"}
                </span>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <div class="me-3">
                    <div class="bg-light rounded-circle p-3">
                      <i class="fas fa-graduation-cap text-primary fa-2x"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1">Score</h6>
                    <div class="d-flex align-items-center">
                      <span class="text-primary fw-bold h4 mb-0">${achievement.score.toFixed(1)}</span>
                      <span class="ms-1 text-muted">/10</span>
                    </div>
                  </div>
                </div>
                ${achievement.completionDate ? `
                  <div class="d-flex align-items-center mb-3">
                    <div class="me-3">
                      <div class="bg-light rounded-circle p-3">
                        <i class="fas fa-calendar-check text-info fa-2x"></i>
                      </div>
                    </div>
                    <div>
                      <h6 class="mb-1">Completed</h6>
                      <div class="text-dark fw-medium">${new Date(achievement.completionDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}</div>
                    </div>
                  </div>
                ` : ""}
                ${achievement.certified && achievement.certificateUrl ? `
                  <div class="mt-4">
                    <a href="/certificates/download/${achievement.id}" class="btn btn-outline-success w-100 rounded-pill">
                      <i class="fas fa-download me-2"></i>Download Certificate
                    </a>
                  </div>
                ` : ""}
              </div>
            </div>
          `;
            row.appendChild(col);
        });
        achievementList.appendChild(row);
    }

    // Render statistics
    function renderStatistics(stats) {
        if (!stats) return;

        const statisticsMobile = document.getElementById("statisticsMobile");
        const statisticsDesktop = document.getElementById("statisticsDesktop");
        const chartText = document.getElementById("chartText");

        statisticsMobile.innerHTML = `
          <div class="col-4">
            <div class="card bg-primary bg-opacity-10 rounded h-100">
              <div class="card-body text-center py-2">
                <h3 class="text-primary fw-bold mb-0">${stats.totalCourses}</h3>
                <p class="text-muted mb-0 small">Courses</p>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card bg-success bg-opacity-10 rounded h-100">
              <div class="card-body text-center py-2">
                <h3 class="text-success fw-bold mb-0">${stats.totalCertificates}</h3>
                <p class="text-muted mb-0 small">Certificates</p>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="card bg-info bg-opacity-10 rounded h-100">
              <div class="card-body text-center py-2">
                <h3 class="text-info fw-bold mb-0">${stats.averageScore.toFixed(1)}</h3>
                <p class="text-muted mb-0 small">Avg Score</p>
              </div>
            </div>
          </div>
        `;

        statisticsDesktop.innerHTML = `
          <div class="row g-3">
            <div class="col-12">
              <div class="card bg-primary bg-opacity-10 rounded">
                <div class="card-body text-center py-2">
                  <div class="d-flex align-items-center justify-content-center">
                    <i class="fas fa-book text-primary me-2"></i>
                    <h3 class="text-primary fw-bold mb-0">${stats.totalCourses}</h3>
                  </div>
                  <p class="text-muted mb-0 small">Courses Participated</p>
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="card bg-success bg-opacity-10 rounded">
                <div class="card-body text-center py-2">
                  <div class="d-flex align-items-center justify-content-center">
                    <i class="fas fa-certificate text-success me-2"></i>
                    <h3 class="text-success fw-bold mb-0">${stats.totalCertificates}</h3>
                  </div>
                  <p class="text-muted mb-0 small">Certificates Achieved</p>
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="card bg-info bg-opacity-10 rounded">
                <div class="card-body text-center py-2">
                  <div class="d-flex align-items-center justify-content-center">
                    <i class="fas fa-bookmark text-info me-2"></i>
                    <h3 class="text-info fw-bold mb-0">${stats.averageScore.toFixed(1)}</h3>
                  </div>
                  <p class="text-muted mb-0 small">Average Score</p>
                </div>
              </div>
            </div>
          </div>
        `;

        const certifiedPercentage = stats.totalCourses > 0 ? ((stats.totalCertificates * 100) / stats.totalCourses).toFixed(1) : "0.0";
        const nonCertifiedPercentage = stats.totalCourses > 0 ? (((stats.totalCourses - stats.totalCertificates) * 100) / stats.totalCourses).toFixed(1) : "0.0";
        chartText.innerHTML = `
          <div class="d-flex justify-content-center">
            <div class="me-4">
              <span class="badge bg-success rounded-pill px-2 me-1"><i class="fas fa-circle"></i></span>
              <span class="fw-medium">Certified:</span>
              <span class="fw-bold">${stats.totalCertificates}</span>
              <span class="text-muted">(${certifiedPercentage}%)</span>
            </div>
            <div>
              <span class="badge bg-secondary rounded-pill px-2 me-1"><i class="fas fa-circle"></i></span>
              <span class="fw-medium">Not Certified:</span>
              <span class="fw-bold">${stats.totalCourses - stats.totalCertificates}</span>
              <span class="text-muted">(${nonCertifiedPercentage}%)</span>
            </div>
          </div>
        `;

        const ctx = document.getElementById("certificatePieChart").getContext("2d");

        // Hủy biểu đồ cũ nếu tồn tại
        if (certificateChart) {
            certificateChart.destroy();
        }

        // Tạo biểu đồ mới
        certificateChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Certified", "Not Certified"],
                datasets: [{
                    data: [stats.totalCertificates, stats.totalCourses - stats.totalCertificates],
                    backgroundColor: ["#28a745", "#dee2e6"],
                    borderColor: "#ffffff",
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                    legend: {position: "bottom", labels: {font: {size: 14, weight: "bold"}, padding: 10}},
                    title: {
                        display: true,
                        text: "Certificate Distribution",
                        font: {size: 16, weight: "bold"},
                        padding: 10
                    },
                    tooltip: {
                        backgroundColor: "rgba(0,0,0,0.8)",
                        padding: 15,
                        titleFont: {size: 16, weight: "bold"},
                        bodyFont: {size: 14},
                        callbacks: {
                            label: function (context) {
                                const label = context.label || "";
                                const value = context.raw || 0;
                                const total = stats.totalCourses;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            },
                        },
                    },
                },
                animation: {animateScale: true, animateRotate: true},
            },
        });
    }

    // Render pagination
    function renderPagination(currentPage, totalPages, totalItems) {
        const paginationSection = document.getElementById("paginationSection");
        paginationSection.innerHTML = "";

        if (totalPages === 0) return;

        const nav = document.createElement("nav");
        nav.setAttribute("aria-label", "Achievement pagination");
        const ul = document.createElement("ul");
        ul.className = "pagination pagination-lg justify-content-center";

        ul.innerHTML += `
          <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="1" aria-label="First">First</a>
          </li>
          <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">Back</a>
          </li>
        `;

        if (currentPage > 3) {
            ul.innerHTML += `
            <li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>
            <li class="page-item disabled"><span class="page-link">...</span></li>
          `;
        }

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            ul.innerHTML += `
            <li class="page-item ${currentPage === i ? "active" : ""}">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
          `;
        }

        if (currentPage < totalPages - 2) {
            ul.innerHTML += `
            <li class="page-item disabled"><span class="page-link">...</span></li>
            <li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>
          `;
        }

        ul.innerHTML += `
          <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">Next</a>
          </li>
          <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${totalPages}" aria-label="Last">Last</a>
          </li>
        `;

        nav.appendChild(ul);
        paginationSection.appendChild(nav);

        const summary = document.createElement("div");
        summary.className = "text-center mt-3";
        const start = (currentPage - 1) * 10 + 1;
        const end = Math.min(currentPage * 10, totalItems);
        summary.innerHTML = `
          <p class="text-muted mb-0">
            Showing ${start} to ${end} of ${totalItems} achievements
          </p>
        `;
        paginationSection.appendChild(summary);

        document.querySelectorAll(".page-link").forEach((link) => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute("data-page"));
                if (!isNaN(page)) fetchAchievements(page);
            });
        });
    }
});

function printAchievements() {
    var printContent = document.getElementById("achievementList").cloneNode(true);
    var originalContent = document.body.innerHTML;

    var printContainer = document.createElement("div");
    printContainer.style.padding = "20px";
    printContainer.style.fontFamily = "Arial, sans-serif";

    var title = document.createElement("div");
    title.innerHTML = "<h1 style='text-align: center; color: #2c3e50; margin-bottom: 20px;'>Achievements Report</h1>";
    title.innerHTML += "<div style='text-align: center; margin-bottom: 30px; color: #7f8c8d;'>Print date: " + new Date().toLocaleDateString() + "</div>";

    var tableStyle = document.createElement("style");
    tableStyle.textContent = `
            .card { margin-bottom: 20px; border: 1px solid #ddd; }
            .card-header { background-color: #f8f9fa; padding: 10px; }
            .card-body { padding: 15px; }
            .badge { padding: 5px 10px; }
            @media print {
                body { -webkit-print-color-adjust: exact; color-adjust: exact; }
                .card { break-inside: avoid; }
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