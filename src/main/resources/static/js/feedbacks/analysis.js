document.addEventListener("DOMContentLoaded", function () {
    const ratingColors = [
        "rgba(128,128,128,0.8)",  // 1★
        "rgba(173,216,230,0.8)",  // 2★
        "rgba(100,149,237,0.8)",  // 3★
        "rgba(65,105,225,0.8)",   // 4★
        "rgba(0,0,255,0.8)"       // 5★
    ];

    const courseChartData = window.courseChartData || {};
    const instructorChartData = window.instructorChartData || {};

    const courseCategories = [
        "practicalApplications", "clarityOfExplanation", "courseStructure",
        "clarityOfMaterial", "supportMaterials", "uptodateMaterials"
    ];

    const instructorCategories = [
        "courseKnowledge", "communicationSkills", "approachability",
        "engagement", "professionalism"
    ];

    const drawBarChart = (ctxId, label, data) => {
        const ctx = document.getElementById(ctxId)?.getContext("2d");
        if (!ctx) return;
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["1★", "2★", "3★", "4★", "5★"],
                datasets: [{
                    label,
                    data: data || [0, 0, 0, 0, 0],
                    backgroundColor: ratingColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Ratings' } },
                    x: { title: { display: true, text: 'Rating Score' } }
                },
                plugins: {
                    title: { display: true, text: label }
                }
            }
        });
    };

    const drawPieChart = (ctxId, data, title) => {
        const ctx = document.getElementById(ctxId)?.getContext("2d");
        if (!ctx) return;
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["1★", "2★", "3★", "4★", "5★"],
                datasets: [{
                    data: data || [0, 0, 0, 0, 0],
                    backgroundColor: ratingColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: "right", labels: { boxWidth: 20 } },
                    title: { display: true, text: title }
                }
            }
        });
    };

    courseCategories.forEach(category => {
        const label = category.replace(/([A-Z])/g, " $1").trim();
        drawBarChart(`${category}Chart`, label, courseChartData[category]);
    });

    drawPieChart("CoursePieChart", courseChartData["overall"], "Overall Course Ratings Distribution");

    instructorCategories.forEach(category => {
        const label = category.replace(/([A-Z])/g, " $1").trim();
        drawBarChart(`${category}Chart`, label, instructorChartData[category]);
    });

    drawPieChart("instructorPieChart", instructorChartData["overall"], "Overall Instructor Ratings Distribution");

    // Xử lý datalist cho course
    document.querySelector('input[name="courseName"]').addEventListener("input", function () {
        const selectedOption = Array.from(document.querySelectorAll("#courseList option"))
            .find(option => option.value === this.value);
        if (selectedOption) {
            this.value = selectedOption.textContent;
            document.getElementById("courseId").value = selectedOption.value;
        } else {
            this.value = "";
            document.getElementById("courseId").value = "";
        }
    });

    // Xử lý datalist cho instructor
    document.querySelector('input[name="instructorName"]').addEventListener("input", function () {
        const selectedOption = Array.from(document.querySelectorAll("#instructorList option"))
            .find(option => option.value === this.value);
        if (selectedOption) {
            this.value = selectedOption.textContent;
            document.getElementById("instructorId").value = selectedOption.value;
        } else {
            this.value = "";
            document.getElementById("instructorId").value = "";
        }
    });
});
