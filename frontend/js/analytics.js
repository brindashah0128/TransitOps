/**
 * TransitOps AI - System Analytics & Reporting controller
 */

let mileageChart = null;
let radarChart = null;

document.addEventListener("DOMContentLoaded", () => {
  // Build initial Charts
  initMileageChart();
  initRadarChart();

  // Bind export actions
  initExportActions();

  // Propulsion filter action
  const propulsionSelector = document.getElementById("propulsion-selector");
  if (propulsionSelector) {
    propulsionSelector.addEventListener("change", updateAnalyticsCharts);
  }
});

// Bar Chart plotting propulsion categories
function initMileageChart() {
  const canvas = document.getElementById("propulsion-mileage-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Diesel Freight (k Miles)",
        data: [42, 48, 55, 52, 59, 64],
        backgroundColor: "rgba(37, 99, 235, 0.75)",
        borderColor: "#2563EB",
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: "EV Class-8 (k Miles)",
        data: [18, 22, 28, 30, 34, 38],
        backgroundColor: "rgba(6, 182, 212, 0.75)",
        borderColor: "#06B6D4",
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  mileageChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#94a3b8" } }
      },
      scales: {
        x: { grid: { color: "rgba(51, 65, 85, 0.2)" }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "rgba(51, 65, 85, 0.2)" }, ticks: { color: "#94a3b8" } }
      }
    }
  });
}

// Radar Chart plotting fleet benchmarks
function initRadarChart() {
  const canvas = document.getElementById("metrics-radar-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const radarData = {
    labels: ["Safety Score", "Overhead Efficiency", "Dispatch Speed", "Fuel Optimization", "Pilot Rating"],
    datasets: [{
      label: "Fleet Benchmark",
      data: [88, 82, 91, 85, 94],
      borderColor: "#06B6D4",
      backgroundColor: "rgba(6, 182, 212, 0.2)",
      borderWidth: 2,
      pointBackgroundColor: "#2563EB"
    }]
  };

  radarChart = new Chart(ctx, {
    type: "radar",
    data: radarData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { color: "rgba(51, 65, 85, 0.4)" },
          grid: { color: "rgba(51, 65, 85, 0.3)" },
          pointLabels: { color: "#94a3b8", font: { family: "Inter", size: 10 } },
          ticks: { backdropColor: "transparent", color: "#64748b" }
        }
      }
    }
  });
}

// Update charts based on selector parameter
function updateAnalyticsCharts(e) {
  if (!mileageChart || !radarChart) return;

  const val = e.target.value;

  if (val === "electric") {
    // Hide diesel dataset
    mileageChart.setDatasetVisibility(0, false);
    mileageChart.setDatasetVisibility(1, true);
    radarChart.data.datasets[0].data = [96, 92, 85, 98, 92]; // EV scores
  } else if (val === "diesel") {
    // Hide electric dataset
    mileageChart.setDatasetVisibility(0, true);
    mileageChart.setDatasetVisibility(1, false);
    radarChart.data.datasets[0].data = [80, 75, 94, 72, 95]; // Diesel scores
  } else {
    // Reset both visible
    mileageChart.setDatasetVisibility(0, true);
    mileageChart.setDatasetVisibility(1, true);
    radarChart.data.datasets[0].data = [88, 82, 91, 85, 94]; // Combined
  }

  mileageChart.update();
  radarChart.update();
}

function initExportActions() {
  const pdfBtn = document.getElementById("export-pdf-btn");
  const csvBtn = document.getElementById("export-csv-btn");

  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      window.showToast?.("TransitOps-Operational-Report.pdf created and downloaded successfully.", "success");
    });
  }

  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      window.showToast?.("Operations-Overhead-Ledger.csv generated.", "success");
    });
  }
}
