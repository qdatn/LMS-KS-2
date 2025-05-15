

document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  const {
    monthlyStats,
    weeklyStats,
    dailyStats,
    hourlyStats,
    methodStats,
    typeStats,
    loginsByDay,
    topAccessedPaths,
    topActiveUsers,
    browserStats,
    heatmapData
  } = window;

  // const errorAndAnomalyStats = /*[[${errorAndAnomalyStats}]]*/ {};

  // const errorAndAnomalyStatsByDay = /*[[${errorAndAnomalyStatsByDaySeparated}]]*/ {};
  const errorAndAnomalyStats = {
    ERROR: {
      "00:00": 5,
      "01:00": 3,
      "02:00": 2,
      "03:00": 1,
      "04:00": 0,
      "05:00": 2,
      "06:00": 4,
      "07:00": 6,
      "08:00": 8,
      "09:00": 7,
      "10:00": 5,
      "11:00": 4,
      "12:00": 3,
      "13:00": 2,
      "14:00": 1,
      "15:00": 3,
      "16:00": 4,
      "17:00": 5,
      "18:00": 6,
      "19:00": 4,
      "20:00": 3,
      "21:00": 2,
      "22:00": 1,
      "23:00": 0,
    },
    ANOMALY: {
      "00:00": 2,
      "01:00": 1,
      "02:00": 0,
      "03:00": 1,
      "04:00": 2,
      "05:00": 3,
      "06:00": 4,
      "07:00": 5,
      "08:00": 6,
      "09:00": 7,
      "10:00": 6,
      "11:00": 5,
      "12:00": 4,
      "13:00": 3,
      "14:00": 2,
      "15:00": 1,
      "16:00": 2,
      "17:00": 3,
      "18:00": 4,
      "19:00": 3,
      "20:00": 2,
      "21:00": 1,
      "22:00": 0,
      "23:00": 1,
    },
  };

  const errorAndAnomalyStatsByDay = {
    ERROR: {
      "2024-01-01": 15,
      "2024-01-02": 20,
      "2024-01-03": 18,
      "2024-01-04": 22,
      "2024-01-05": 25,
      "2024-01-06": 19,
      "2024-01-07": 16,
      "2024-01-08": 21,
      "2024-01-09": 23,
      "2024-01-10": 17,
    },
    ANOMALY: {
      "2024-01-01": 10,
      "2024-01-02": 12,
      "2024-01-03": 15,
      "2024-01-04": 18,
      "2024-01-05": 20,
      "2024-01-06": 14,
      "2024-01-07": 11,
      "2024-01-08": 16,
      "2024-01-09": 19,
      "2024-01-10": 13,
    },
  };

  function createGradient(ctx, color1, color2) {
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }
  function renderBarChart(canvasId, data, label, color1, color2) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const gradient = createGradient(ctx, color1, color2);
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: label,
            data: Object.values(data),
            backgroundColor: gradient,
            borderColor: color1,
            borderWidth: 2,
            borderRadius: 10,
            hoverBackgroundColor: color1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: { ticks: { color: "#666", font: { size: 12 } } },
          y: {
            beginAtZero: true,
            ticks: { color: "#666", font: { size: 12 } },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
        },
        animation: {
          duration: 1500,
          easing: "easeOutQuart",
        },
      },
    });
  }
  function renderLineChart(canvasId, data, label, color1, color2) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const canvas = ctx.canvas;

    // Tìm giá trị max trong dữ liệu
    const maxValue = Math.max(...Object.values(data));

    // Tính toán stepSize dựa trên chiều cao của canvas
    let stepSize;
    if (canvas.height <= 200) {
      // Biểu đồ nhỏ
      stepSize = Math.ceil(maxValue / 5); // Chia thành 5 mốc
    } else if (canvas.height <= 300) {
      // Biểu đồ trung bình
      stepSize = Math.ceil(maxValue / 8); // Chia thành 8 mốc
    } else {
      // Biểu đồ lớn
      // Tính stepSize chi tiết hơn cho biểu đồ lớn
      if (maxValue <= 20) stepSize = 2;
      else if (maxValue <= 50) stepSize = 5;
      else if (maxValue <= 100) stepSize = 10;
      else if (maxValue <= 500) stepSize = 50;
      else stepSize = Math.ceil(maxValue / 10);
    }

    // Làm tròn stepSize để có số đẹp
    const magnitude = Math.pow(10, Math.floor(Math.log10(stepSize)));
    stepSize = Math.ceil(stepSize / magnitude) * magnitude;

    // Tạo gradient cho area fill
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, `${color2.replace("0.2", "0.4")}`);
    gradientFill.addColorStop(1, `${color2.replace("0.2", "0.05")}`);

    new Chart(ctx, {
      type: "line",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: label,
            data: Object.values(data),
            borderColor: color1,
            backgroundColor: gradientFill,
            borderWidth: 2.5,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#fff",
            pointBorderColor: color1,
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            pointHoverBackgroundColor: color1,
            pointHoverBorderColor: "#fff",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#555",
              font: {
                size: 12,
                weight: "500",
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            titleFont: {
              size: 14,
              weight: "bold",
              family: "'Segoe UI', sans-serif",
            },
            bodyColor: "rgba(255, 255, 255, 0.8)",
            bodyFont: {
              size: 12,
              family: "'Segoe UI', sans-serif",
            },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
                weight: "500",
              },
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
                weight: "500",
              },
              padding: 10,
              stepSize: stepSize,
              callback: function (value) {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + "M";
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(1) + "K";
                }
                return value;
              },
            },
          },
        },
        animation: {
          duration: 2000,
          easing: "easeOutQuart",
          onProgress: function (animation) {
            animation.chart.data.datasets.forEach((dataset) => {
              dataset.pointBackgroundColor = dataset.data.map(
                  (value, index) => {
                    return animation.currentStep >=
                    (index / dataset.data.length) * animation.numSteps
                        ? "#fff"
                        : "transparent";
                  }
              );
            });
          },
        },
        elements: {
          line: {
            borderCapStyle: "round",
            borderJoinStyle: "round",
          },
        },
      },
    });
  }

  function renderPieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: [
              "#ff6384",
              "#36a2eb",
              "#ffce56",
              "#4bc0c0",
              "#9966ff",
            ],
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#555", font: { size: 12 }, padding: 15 },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
          },
        },
        animation: { duration: 1500, easing: "easeOutQuart" },
      },
    });
  }
  function renderStackedBarChart(canvasId, data, label) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const datasets = Object.keys(data).map((key, index) => ({
      label: key,
      data: Object.values(data[key]),
      backgroundColor: [
        "#ff6384",
        "#36a2eb",
        "#ffce56",
        "#4bc0c0",
        "#9966ff",
      ][index % 5],
      borderWidth: 1,
    }));
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(Object.values(data)[0]), // Giả định các key trong sub-map là giờ                        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "top" },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#666", font: { size: 12 } },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: { color: "#666", font: { size: 12 } },
          },
        },
        animation: {
          duration: 1500,
          easing: "easeOutQuart",
        },
      },
    });
  }

  function renderBrowserPieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    // Distinctive colors and gradients for browsers
    const browserColors = {
      Chrome: {
        main: "#FF1B2D", // Opera Red
        gradient: ["#FF1B2D", "#FF4B2D", "#C40000"], // Opera colors
      },
      Firefox: {
        main: "#FF9500", // Firefox Orange
        gradient: ["#FF9500", "#FF0039", "#9400FF"], // Firefox colors
      },
      Safari: {
        main: "#007AFF", // Safari Blue
        gradient: ["#007AFF", "#34AADC", "#5856D6"], // Safari/iOS colors
      },
      Edge: {
        main: "#00FF00", // Green for Edge as it's common
        gradient: ["#00FF00", "#00CC00", "#009900"], // Green gradients
      },
      Opera: {
        main: "#FF1B2D", // Opera Red
        gradient: ["#FF1B2D", "#FF4B2D", "#C40000"], // Opera colors
      },
      "Internet Explorer": {
        main: "#0076D6", // IE Blue
        gradient: ["#0076D6", "#00A2ED", "#004E8C"], // IE colors
      },
      "Samsung Browser": {
        main: "#1428A0", // Samsung Blue
        gradient: ["#1428A0", "#0A3588", "#5270E8"], // Samsung colors
      },
      "UC Browser": {
        main: "#FF6A00", // UC Browser Orange
        gradient: ["#FF6A00", "#E94600", "#FF9E50"], // UC Browser colors
      },
      Other: {
        main: "#A9A9A9", // Gray
        gradient: ["#A9A9A9", "#787878", "#CFCFCF"], // Grays
      },
    };

    // Create color arrays and borderColor arrays based on browsers
    const colors = [];
    const borderColors = [];
    const hoverColors = [];

    Object.keys(data).forEach((browser) => {
      const colorInfo = browserColors[browser] || {
        main: "#" + Math.floor(Math.random() * 16777215).toString(16),
        gradient: [
          "#" + Math.floor(Math.random() * 16777215).toString(16),
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        ],
      };

      colors.push(colorInfo.main);
      borderColors.push("#FFFFFF");
      hoverColors.push(colorInfo.gradient[0]); // Use first gradient color for hover
    });

    new Chart(ctx, {
      type: "doughnut", // Use doughnut instead of pie for better effect
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverBackgroundColor: hoverColors,
            hoverBorderColor: "#FFFFFF",
            hoverBorderWidth: 4,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // Set hole size for doughnut chart
        plugins: {
          title: {
            display: false,
          },
          legend: {
            position: "bottom",
            labels: {
              color: "#555",
              font: { size: 12, weight: "bold" },
              padding: 15,
              usePointStyle: true, // Use round points instead of squares
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: { size: 16, weight: "bold" },
            bodyFont: { size: 14 },
            padding: 15,
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            boxPadding: 3,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce(
                    (a, b) => a + b,
                    0
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
              labelTextColor: function (context) {
                // Text color in tooltip based on element color
                return "#FFFFFF";
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 2000,
          easing: "easeOutElastic",
        },
      },
    });
  }
  function renderHeatmap(canvasId, heatmapData) {
    // Khởi tạo canvas mới
    const canvas = document.getElementById(canvasId);
    const parentElement = canvas.parentElement;
    const canvasWidth = Math.max(900, parentElement.clientWidth - 40);
    const canvasHeight = 500;

    // Tạo canvas mới để tránh xung đột với Chart.js
    canvas.remove();
    const newCanvas = document.createElement("canvas");
    newCanvas.id = canvasId;
    newCanvas.height = canvasHeight;
    newCanvas.width = canvasWidth;
    newCanvas.style.margin = "0 auto";
    newCanvas.style.display = "block";
    parentElement.appendChild(newCanvas);

    const ctx = newCanvas.getContext("2d");

    // Thiết lập khoảng cách lề
    const margin = {
      left: 100,
      right: 20,
      top: 40,
      bottom: 60,
    };

    // Tính toán kích thước ô
    const cellWidth = Math.floor(
        (canvasWidth - margin.left - margin.right) / 24
    );
    const cellHeight = Math.floor(
        (canvasHeight - margin.top - margin.bottom) / 7
    );

    // Tìm giá trị lớn nhất
    let maxValue = Math.max(...heatmapData.data.flat());

    // Vẽ nền
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Vẽ tiêu đề
    ctx.fillStyle = "#333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
        "Activity Heatmap - Weekly Distribution",
        canvasWidth / 2,
        10
    );

    // Tạo gradient màu (từ xanh dương đến đỏ)
    const colorGradient = [
      "rgba(10, 20, 120, 0.9)", // Xanh đậm nhất
      "rgba(30, 60, 180, 0.9)",
      "rgba(50, 120, 220, 0.9)",
      "rgba(80, 180, 250, 0.9)", // Xanh nhạt
      "rgba(120, 220, 120, 0.9)", // Xanh lá
      "rgba(220, 220, 60, 0.9)", // Vàng
      "rgba(250, 140, 30, 0.9)", // Cam
      "rgba(230, 30, 30, 0.9)", // Đỏ
    ];

    // Vẽ nhãn ngày
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    heatmapData.days.forEach((day, i) => {
      ctx.fillText(
          day,
          margin.left - 10,
          margin.top + (i + 0.5) * cellHeight
      );
    });

    // Vẽ nhãn giờ
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    heatmapData.hours.forEach((hour, j) => {
      if (j % 2 === 0) {
        ctx.save();
        ctx.translate(
            margin.left + (j + 0.5) * cellWidth,
            margin.top + 7 * cellHeight + 10
        );
        ctx.rotate(Math.PI / 4);
        ctx.fillText(hour, 0, 0);
        ctx.restore();
      }
    });

    // Vẽ tiêu đề trục
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Hours of Day", canvasWidth / 2, canvasHeight - 15);

    ctx.save();
    ctx.translate(20, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Days of Week", 0, 0);
    ctx.restore();

    // Vẽ heatmap
    const cellMap = [];
    heatmapData.data.forEach((row, i) => {
      cellMap[i] = [];
      row.forEach((value, j) => {
        const x = margin.left + j * cellWidth;
        const y = margin.top + i * cellHeight;

        // Lưu thông tin ô
        cellMap[i][j] = {
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          value,
          day: heatmapData.days[i],
          hour: heatmapData.hours[j],
        };

        // Tính màu dựa trên giá trị
        const normalizedValue = maxValue > 0 ? value / maxValue : 0;
        const colorIndex = Math.min(
            Math.floor(normalizedValue * colorGradient.length),
            colorGradient.length - 1
        );

        // Vẽ ô với màu gradient
        ctx.fillStyle = colorGradient[colorIndex];
        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);

        // Vẽ viền ô
        ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellWidth - 1, cellHeight - 1);

        // Hiển thị giá trị trong ô
        if (value > 0) {
          ctx.fillStyle =
              colorIndex > colorGradient.length / 2 ? "white" : "black";
          const fontSize = Math.min(
              Math.max(10, Math.floor(12 * (0.5 + normalizedValue))),
              16
          );
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
              value.toString(),
              x + cellWidth / 2,
              y + cellHeight / 2
          );
        }
      });
    });

    // Vẽ thanh chú thích màu
    const legend = {
      width: 400,
      height: 25,
      x: (canvasWidth - 400) / 2,
      y: canvasHeight - margin.bottom + 30,
    };

    // Tạo gradient cho chú thích
    const legendGradient = ctx.createLinearGradient(
        legend.x,
        0,
        legend.x + legend.width,
        0
    );
    colorGradient.forEach((color, i) => {
      legendGradient.addColorStop(i / (colorGradient.length - 1), color);
    });

    // Vẽ thanh chú thích
    ctx.fillStyle = legendGradient;
    ctx.fillRect(legend.x, legend.y, legend.width, legend.height);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(legend.x, legend.y, legend.width, legend.height);

    // Vẽ thang giá trị
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 5; i++) {
      const x = legend.x + (i / 5) * legend.width;
      const value = Math.round((i / 5) * maxValue);
      ctx.beginPath();
      ctx.moveTo(x, legend.y + legend.height);
      ctx.lineTo(x, legend.y + legend.height + 5);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(value.toString(), x, legend.y + legend.height + 8);
    }

    // Tiêu đề chú thích
    ctx.font = "bold 14px Arial";
    ctx.fillText(
        "Số lượng hoạt động",
        legend.x + legend.width / 2,
        legend.y - 20
    );

    // Thêm tooltip
    const tooltip = document.createElement("div");
    Object.assign(tooltip.style, {
      position: "absolute",
      padding: "8px 12px",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "bold",
      pointerEvents: "none",
      display: "none",
      zIndex: "1000",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    });
    document.body.appendChild(tooltip);

    // Xử lý hover
    newCanvas.addEventListener("mousemove", (event) => {
      const rect = newCanvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let found = false;
      cellMap.forEach((row) => {
        row.forEach((cell) => {
          if (
              mouseX >= cell.x &&
              mouseX <= cell.x + cell.width &&
              mouseY >= cell.y &&
              mouseY <= cell.y + cell.height
          ) {
            tooltip.innerHTML = `<strong>${cell.day}, ${cell.hour}</strong><br>Số hoạt động: ${cell.value}`;
            tooltip.style.display = "block";
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
            document.body.style.cursor = "pointer";
            found = true;
          }
        });
      });

      if (!found) {
        document.body.style.cursor = "default";
        tooltip.style.display = "none";
      }
    });

    // Ẩn tooltip khi rời khỏi canvas
    newCanvas.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
      document.body.style.cursor = "default";
    });

    // Xử lý click
    newCanvas.addEventListener("click", (event) => {
      const rect = newCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      cellMap.forEach((row) => {
        row.forEach((cell) => {
          if (
              x >= cell.x &&
              x <= cell.x + cell.width &&
              y >= cell.y &&
              y <= cell.y + cell.height
          ) {
            if (typeof showActivityDetails === "function") {
              showActivityDetails(cell.day, cell.hour, cell.value);
            } else {
              alert(
                  `Chi tiết hoạt động:\nNgày: ${cell.day}\nGiờ: ${cell.hour}\nSố lượng: ${cell.value}`
              );
            }
          }
        });
      });
    });
  }

  // Tùy chọn: Thêm hàm hiển thị chi tiết hoạt động
  function showActivityDetails(day, hour, count) {
    console.log(`Showing details for ${day}, ${hour}, count: ${count}`);

    // Tạo modal hiển thị chi tiết thay vì alert
    const modalHtml = `
          <div class="modal fade" id="activityDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Activity Details</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="card">
                    <div class="card-header bg-primary text-white">
                      <h6 class="mb-0">${day}, ${hour}</h6>
                    </div>
                    <div class="card-body">
                      <p class="h3 text-center">${count} <small class="text-muted">activities</small></p>         
                    </div>                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

    // Thêm modal vào body nếu chưa tồn tại
    if (!document.getElementById("activityDetailModal")) {
      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
    } else {
      // Cập nhật nội dung modal nếu đã tồn tại
      const existingModal = document.getElementById("activityDetailModal");
      const newModal = document.createElement("div");
      newModal.innerHTML = modalHtml;
      existingModal.parentNode.replaceChild(
          newModal.firstElementChild,
          existingModal
      );
    }

    // Hiển thị modal
    const modal = new bootstrap.Modal(
        document.getElementById("activityDetailModal")
    );
    modal.show();
  }

  // Hàm giả định để xem chi tiết hoạt động
  function viewDetailedActivities(day, hour) {
    console.log(`Viewing detailed activities for ${day}, ${hour}`);

    // Tạo modal hiển thị danh sách chi tiết
    const modalHtml = `
          <div class="modal fade" id="detailedActivitiesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Detailed Activities - ${day}, ${hour}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>${hour}</td>
                          <td>user1@example.com</td>
                          <td>Login</td>
                          <td>Successful login from Chrome</td>
                        </tr>
                        <tr>
                          <td>${hour}</td>
                          <td>user2@example.com</td>
                          <td>Page View</td>
                          <td>Viewed dashboard</td>
                        </tr>
                        <tr>
                          <td>${hour}</td>
                          <td>user3@example.com</td>
                          <td>Action</td>
                          <td>Updated profile</td>
                        </tr>
                        <tr>
                          <td>${hour}</td>
                          <td>user4@example.com</td>
                          <td>Login</td>
                          <td>Successful login from Firefox</td>
                        </tr>
                        <tr>
                          <td>${hour}</td>
                          <td>user5@example.com</td>
                          <td>Page View</td>
                          <td>Viewed reports</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        `;

    // Thêm modal vào body nếu chưa tồn tại
    if (!document.getElementById("detailedActivitiesModal")) {
      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = modalHtml;
      document.body.appendChild(modalContainer);
    } else {
      // Cập nhật nội dung modal nếu đã tồn tại
      const existingModal = document.getElementById(
          "detailedActivitiesModal"
      );
      const newModal = document.createElement("div");
      newModal.innerHTML = modalHtml;
      existingModal.parentNode.replaceChild(
          newModal.firstElementChild,
          existingModal
      );
    }

    // Hiển thị modal
    const modal = new bootstrap.Modal(
        document.getElementById("detailedActivitiesModal")
    );
    modal.show();
  }

  renderBarChart(
      "monthlyChart",
      monthlyStats,
      "Monthly Activities",
      "#4bc0c0",
      "rgba(75, 192, 192, 0.3)",
      true
  );
  renderBarChart(
      "weeklyChart",
      weeklyStats,
      "Weekly Activities",
      "#36a2eb",
      "rgba(54, 162, 235, 0.3)",
      true
  );
  renderBarChart(
      "dailyChart",
      dailyStats,
      "Daily Activities",
      "#ffce56",
      "rgba(255, 206, 86, 0.3)",
      true
  );
  renderLineChart(
      "lineChart",
      methodStats,
      "Method Trends",
      "#9966ff",
      "rgba(153, 102, 255, 0.2)"
  );
  renderLineChart(
      "hourlyStats",
      hourlyStats,
      "Hourly Activities",
      "#36a2eb",
      "rgba(153, 102, 255, 0.2)"
  );
  renderPieChart("pieChart", typeStats);
  renderLineChart(
      "loginsByDayChart",
      loginsByDay,
      "Logins By Day",
      "#ff6384",
      "rgba(255, 99, 132, 0.2)"
  );
  renderBarChart(
      "topAccessedPathsChart",
      topAccessedPaths,
      "Top Accessed Paths",
      "#ffce56",
      "rgba(255, 206, 86, 0.3)",
      true
  );
  renderBarChart(
      "topActiveUsersChart",
      topActiveUsers,
      "Top Active Users",
      "#4bc0c0",
      "rgba(75, 192, 192, 0.3)",
      true
  );
  renderBrowserPieChart("browserChart", browserStats);
  renderHeatmap("heatmapCanvas", heatmapData);

  // Render error and anomaly chart

  const ctx = document
      .getElementById("errorAndAnomalyStats")
      .getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(errorAndAnomalyStats.ERROR || {}),
      datasets: [
        {
          label: "Errors",
          data: Object.values(errorAndAnomalyStats.ERROR || {}),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Anomalies",
          data: Object.values(errorAndAnomalyStats.ANOMALY || {}),
          borderColor: "#ffce56",
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#555",
            font: {
              size: 12,
              weight: "500",
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyColor: "rgba(255, 255, 255, 0.8)",
          bodyFont: {
            size: 12,
          },
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            font: {
              size: 12,
              weight: "500",
            },
            padding: 10,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });

  // Render error and anomaly chart by day
  const ctxDay = document
      .getElementById("errorAndAnomalyStatsByDay")
      .getContext("2d");
  new Chart(ctxDay, {
    type: "line",
    data: {
      labels: Object.keys(errorAndAnomalyStatsByDay.ERROR || {}),
      datasets: [
        {
          label: "Errors",
          data: Object.values(errorAndAnomalyStatsByDay.ERROR || {}),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Anomalies",
          data: Object.values(errorAndAnomalyStatsByDay.ANOMALY || {}),
          borderColor: "#ffce56",
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#555",
            font: {
              size: 12,
              weight: "500",
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyColor: "rgba(255, 255, 255, 0.8)",
          bodyFont: {
            size: 12,
          },
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            font: {
              size: 12,
              weight: "500",
            },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            font: {
              size: 12,
              weight: "500",
            },
            padding: 10,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Dữ liệu mẫu
  const {
    hourlyAccessStats,
  } = window;

  console.log("Hourly Access Stats:", hourlyAccessStats); // Thêm log để kiểm tra dữ liệu

  const availableDates = Object.keys(hourlyAccessStats);
  console.log("Available Dates:", availableDates); // Thêm log để kiểm tra ngày có sẵn

  const datePicker = document.getElementById("datePicker");
  const selectedDatesContainer = document.getElementById(
      "selectedDatesContainer"
  );
  let selectedDates = [];
  const MAX_SELECTED_DATES = 5;

  // Khởi tạo biểu đồ
  const ctx = document.getElementById("hourlyAccessChart").getContext("2d");
  const hourlyAccessChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from(
          { length: 24 },
          (_, i) => `${i.toString().padStart(2, "0")}:00`
      ),
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { drawBorder: false },
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // Hàm lấy dữ liệu theo giờ
  function getHourlyDataArray(date) {
    const hourlyDataObj = hourlyAccessStats[date] || {};
    console.log(`Getting data for date: ${date}`, hourlyDataObj); // Thêm log để kiểm tra dữ liệu cho ngày cụ thể

    return Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, "0")}:00`;
      return hourlyDataObj[hour] || 0;
    });
  }

  // Cập nhật danh sách ngày đã chọn
  function updateSelectedDates() {
    selectedDatesContainer.innerHTML = "";

    if (selectedDates.length === 0) {
      selectedDatesContainer.innerHTML = `
                    <span class="text-muted">
                        <i class="fas fa-calendar-times"></i> No selected days
                    </span>`;
      return;
    }

    selectedDates.forEach((date) => {
      const dateTag = document.createElement("div");
      dateTag.classList.add(
          "date-tag",
          "badge",
          "bg-primary",
          "me-2",
          "mb-2"
      );
      dateTag.dataset.date = date;
      dateTag.innerHTML = `
                    <i class="fas fa-calendar-day me-1"></i>
                    ${date}
                    <button class="btn-close btn-close-white ms-2 remove-date"
                            aria-label="Remove date"
                            style="font-size: 0.5em;">
                    </button>`;

      const removeBtn = dateTag.querySelector(".remove-date");
      removeBtn.addEventListener("click", () => {
        dateTag.classList.add("fade-out");
        setTimeout(() => {
          selectedDates = selectedDates.filter((d) => d !== date);
          updateSelectedDates();
          updateChart();
        }, 300);
      });

      selectedDatesContainer.appendChild(dateTag);
    });

    // Hiển thị cảnh báo nếu đã chọn tối đa số ngày
    if (selectedDates.length >= MAX_SELECTED_DATES) {
      const warningTag = document.createElement("div");
      warningTag.classList.add("text-warning", "mt-2");
      warningTag.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    Maximum ${MAX_SELECTED_DATES} days can be selected`;
      selectedDatesContainer.appendChild(warningTag);
    }
  }

  // Cập nhật biểu đồ
  function updateChart() {
    console.log("Updating chart with dates:", selectedDates); // Thêm log để kiểm tra ngày đã chọn

    if (selectedDates.length === 0) {
      hourlyAccessChart.data.datasets = [
        {
          label: "No selected days",
          data: Array(24).fill(0),
          borderColor: "#4e73df",
          backgroundColor: "rgba(78, 115, 223, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ];
    } else {
      hourlyAccessChart.data.datasets = selectedDates.map((date, index) => {
        const colors = [
          "#4e73df",
          "#1cc88a",
          "#f6c23e",
          "#e74a3b",
          "#36a2eb",
        ];
        const colorIndex = index % colors.length;
        const hourlyDataArray = getHourlyDataArray(date);

        console.log(`Dataset for ${date}:`, hourlyDataArray); // Thêm log để kiểm tra dữ liệu

        return {
          label: date,
          data: hourlyDataArray,
          borderColor: colors[colorIndex],
          backgroundColor: `${colors[colorIndex]}20`,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        };
      });
    }
    hourlyAccessChart.update();
  }

  // Khởi tạo trạng thái ban đầu
  updateSelectedDates();

  if (availableDates.length > 0) {
    const latestDate = availableDates.sort().reverse()[0];
    selectedDates.push(latestDate);
    updateSelectedDates();
    updateChart();
  }

  // Thêm sự kiện change để tự động thêm ngày khi chọn
  datePicker.addEventListener("change", function () {
    const selectedDate = datePicker.value;
    console.log("Date picker changed to:", selectedDate); // Thêm log để kiểm tra ngày được chọn

    if (selectedDate && !selectedDates.includes(selectedDate)) {
      if (selectedDates.length >= MAX_SELECTED_DATES) {
        alert(
            `You can only select up to ${MAX_SELECTED_DATES} days for comparison`
        );
        return;
      }

      // Kiểm tra xem ngày có trong dữ liệu không
      if (!hourlyAccessStats[selectedDate]) {
        console.warn(`No data available for date: ${selectedDate}`);
        alert(`No data available for the selected date: ${selectedDate}`);
        return;
      }

      selectedDates.push(selectedDate);
      updateSelectedDates();
      updateChart();
    }
  });
});
