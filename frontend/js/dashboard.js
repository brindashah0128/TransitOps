/**
 * TransitOps AI - Dashboard Telematics & Analytics controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Sync core telemetry statistics from backend
  await syncDashboardStats();

  // Initialize the Dark Telematics Leaflet Map
  const map = initDashboardMap();

  // Initialize Responsive Operations Chart.js
  initAnalyticsChart();
  
  // Periodically refresh fake telematics counters for highly active dashboard look
  startTelematicsSimulators();
});

// Fetch active vehicles from backend and place on map with routes
async function syncDashboardStats() {
  try {
    const stats = await window.apiFetch("/api/analytics");
    if (stats) {
      document.getElementById("total-trips-count").innerText = stats.todayTrips;
    }
  } catch (err) {
    console.error("Dashboard stats sync failed:", err);
  }
}

// Leaflet GIS Mapping initialization
function initDashboardMap() {
  const mapElement = document.getElementById("dashboard-leaflet-map");
  if (!mapElement) return null;

  // Center on India coordinate to view active terminals
  const map = L.map("dashboard-leaflet-map", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([20.5937, 78.9629], 5);

  // Set up standard OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Active Vehicle Positions to map
  const activeVehicles = [
    { name: "Volvo FH16 (Truck-12)", status: "On Trip", cargo: "18 Tons", driver: "Rajesh Kumar", lat: 19.0760, lng: 72.8777, destLat: 18.5204, destLng: 73.8567, routeName: "Mumbai to Pune" },
    { name: "Tesla Semi (Truck-05)", status: "On Trip", cargo: "15 Tons", driver: "Amit Patel", lat: 28.6139, lng: 77.2090, destLat: 26.9124, destLng: 75.7873, routeName: "Delhi to Jaipur" },
    { name: "Ford E-Transit (Van-08)", status: "Available", cargo: "None", driver: "None", lat: 12.9716, lng: 77.5946, destLat: null, destLng: null, routeName: "Bengaluru Depot" }
  ];

  // Custom SVG Markers colored by state
  activeVehicles.forEach(vehicle => {
    let color = "#3b82f6"; // default blue
    if (vehicle.status === "Available") color = "#10b981"; // emerald
    if (vehicle.status === "On Trip") color = "#06b6d4"; // cyan
    
    const svgIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-20 animate-ping"></span>
          <div class="w-4.5 h-4.5 rounded-full border-2 border-[#1e293b] flex items-center justify-center shadow-lg" style="background-color: ${color}">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      className: "",
      iconSize: [24, 24]
    });

    const marker = L.marker([vehicle.lat, vehicle.lng], { icon: svgIcon }).addTo(map);
    
    // Popup details
    marker.bindPopup(`
      <div class="p-2 font-sans">
        <h3 class="font-bold text-sm text-white border-b border-slate-700 pb-1 mb-1.5 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
          ${vehicle.name}
        </h3>
        <div class="space-y-1 text-xs text-slate-300">
          <div><strong class="text-slate-400">Driver:</strong> ${vehicle.driver}</div>
          <div><strong class="text-slate-400">Cargo:</strong> ${vehicle.cargo}</div>
          <div><strong class="text-slate-400">Sector:</strong> ${vehicle.routeName}</div>
        </div>
      </div>
    `);

    // Draw route corridors for active trips
    if (vehicle.destLat && vehicle.destLng) {
      const pathPoints = [
        [vehicle.lat, vehicle.lng],
        [vehicle.destLat, vehicle.destLng]
      ];
      const routeLine = L.polyline(pathPoints, {
        color: "#2563eb",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.7
      }).addTo(map);

      // Simple animation of route path
      let count = 0;
      setInterval(() => {
        count = (count + 1) % 100;
        routeLine.setStyle({
          dashOffset: -count
        });
      }, 100);
    }
  });

  // Fit bounds to show India
  setTimeout(() => { map.invalidateSize(); }, 500);

  return map;
}

// Chart.js operations configurations
let operationsChart = null;

function initAnalyticsChart() {
  const canvas = document.getElementById("dashboard-analytics-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  
  const utilizationData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Utilization Rate (%)",
      data: [72, 78, 85, 82, 89, 64, 52],
      borderColor: "#2563EB",
      backgroundColor: "rgba(37, 99, 235, 0.15)",
      borderWidth: 3,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: "#06B6D4",
      pointBorderColor: "#1e293b",
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  const expenseData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenues ($)",
        data: [98000, 105000, 112000, 108000, 118000, 125400],
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.05)",
        borderWidth: 2.5,
        tension: 0.3
      },
      {
        label: "Expenses ($)",
        data: [72000, 75000, 79000, 76000, 81000, 84650],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        borderWidth: 2.5,
        tension: 0.3
      }
    ]
  };

  const chartConfig = {
    type: "line",
    data: utilizationData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
        },
        tooltip: {
          backgroundColor: "#1e293b",
          borderColor: "#334155",
          borderWidth: 1,
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1"
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(51, 65, 85, 0.3)" },
          ticks: { color: "#94a3b8", font: { family: "Inter" } }
        },
        y: {
          grid: { color: "rgba(51, 65, 85, 0.3)" },
          ticks: { color: "#94a3b8", font: { family: "Inter" } }
        }
      }
    }
  };

  operationsChart = new Chart(ctx, chartConfig);

  // Event listener for filter selector
  const filterSelect = document.getElementById("analytics-filter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      const selectedValue = e.target.value;
      if (selectedValue === "utilization") {
        operationsChart.config.data = utilizationData;
        operationsChart.config.type = "line";
      } else {
        operationsChart.config.data = expenseData;
        operationsChart.config.type = "line";
      }
      operationsChart.update();
    });
  }
}

// Background simulation increments
function startTelematicsSimulators() {
  const satelliteEl = document.getElementById("active-gps-satellites");
  if (!satelliteEl) return;

  setInterval(() => {
    // Randomly shift active satellite counts between 16 and 22
    const currentSats = Math.floor(Math.random() * 6) + 16;
    satelliteEl.innerText = `${currentSats} Sats`;
  }, 12000);
}
