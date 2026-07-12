/**
 * TransitOps AI - Driver Registry Operations controller
 */

let driversData = [];
let sparklineChart = null;
let driverMap = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Sync registry from backend
  await loadDriversRegistry();

  // Attach search and filter event listeners
  const searchInput = document.getElementById("driver-search");
  const filterSafety = document.getElementById("driver-filter-safety");
  const filterStatus = document.getElementById("driver-filter-status");

  searchInput.addEventListener("input", filterDriversList);
  filterSafety.addEventListener("change", filterDriversList);
  filterStatus.addEventListener("change", filterDriversList);

  // Close drawer binder
  const closeDrawerBtn = document.getElementById("close-driver-drawer-btn");
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", hideDriverDrawer);
  }
});

// Fetch raw pilots from API
async function loadDriversRegistry() {
  try {
    driversData = await window.apiFetch("/api/drivers");
    renderDriversGrid(driversData);
  } catch (err) {
    console.error("Drivers loading failure:", err);
  }
}

// Render pilots bento cards
function renderDriversGrid(drivers) {
  const container = document.getElementById("drivers-grid");
  if (!container) return;

  container.innerHTML = "";

  if (drivers.length === 0) {
    container.className = "block w-full text-center py-12 text-slate-500";
    container.innerHTML = `
      <div class="flex flex-col items-center gap-2 justify-center">
        <i data-lucide="users" class="w-8 h-8"></i>
        <span>No pilots matched your current operations filters.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Restore grid layout
  container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  drivers.forEach(driver => {
    const card = document.createElement("div");
    card.className = "bg-[#1E293B] border border-slate-800 p-5 rounded-xl hover:border-blue-500/30 transition-all duration-150 shadow-lg flex flex-col justify-between cursor-pointer";
    card.addEventListener("click", () => showDriverDrawer(driver));

    // Determine safety progress colors
    let progressColor = "bg-emerald-500";
    let scoreColor = "text-emerald-400";
    if (driver.safetyScore < 90) { progressColor = "bg-amber-500"; scoreColor = "text-amber-400"; }
    if (driver.safetyScore < 80) { progressColor = "bg-rose-500"; scoreColor = "text-rose-400"; }

    // Status chip colors
    let statusBg = "bg-blue-950 text-blue-400 border-blue-800/40";
    if (driver.status === "Available") statusBg = "bg-emerald-950 text-emerald-400 border-emerald-800/40";
    if (driver.status === "Emergency") statusBg = "bg-rose-950 text-rose-400 border-rose-800/40";

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-blue-600 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 select-none">
              ${driver.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-200">${driver.name}</h3>
              <span class="text-[10px] text-slate-500 font-medium block">Exp: ${driver.experience}</span>
            </div>
          </div>
          <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${statusBg}">${driver.status}</span>
        </div>

        <div class="space-y-4">
          <!-- Rating block -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400">Dispatcher Rating</span>
            <span class="font-bold text-slate-200 flex items-center gap-1">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              ${driver.rating}
            </span>
          </div>

          <!-- Phone core info -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400">Comms Link</span>
            <span class="font-semibold text-slate-300 font-mono">${driver.phone}</span>
          </div>

          <!-- Safety score slide block -->
          <div class="space-y-1.5 pt-1">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold uppercase tracking-wider text-slate-500">Telemetry Safety Score</span>
              <span class="font-bold ${scoreColor}">${driver.safetyScore}%</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div class="h-full rounded-full ${progressColor}" style="width: ${driver.safetyScore}%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-800/60 mt-4 flex justify-between items-center text-[10px] text-slate-500">
        <span class="uppercase tracking-wider font-semibold">CDL: ${driver.license}</span>
        <button class="text-blue-400 font-bold hover:underline">Inspect Profile</button>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

// Client-side filtration
function filterDriversList() {
  const query = document.getElementById("driver-search").value.toLowerCase();
  const safetyFilter = document.getElementById("driver-filter-safety").value;
  const statusFilter = document.getElementById("driver-filter-status").value;

  const filtered = driversData.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(query) || 
                          d.status.toLowerCase().includes(query) || 
                          d.phone.includes(query);
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    
    let matchesSafety = true;
    if (safetyFilter === "EXCELLENT") matchesSafety = d.safetyScore >= 90;
    if (safetyFilter === "WARNING") matchesSafety = d.safetyScore < 80;

    return matchesSearch && matchesStatus && matchesSafety;
  });

  renderDriversGrid(filtered);
}

// Drawer show & dynamic Chart sparklines
function showDriverDrawer(driver) {
  const drawer = document.getElementById("driver-detail-drawer");
  drawer.classList.remove("hidden");
  setTimeout(() => {
    drawer.classList.remove("translate-x-full");
  }, 10);

  // Bind values
  const initials = driver.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const avatarEl = document.getElementById("drawer-driver-avatar");
  if (avatarEl) {
    avatarEl.innerText = initials;
  }
  document.getElementById("drawer-driver-name").innerText = driver.name;
  document.getElementById("drawer-driver-status").innerText = driver.status;
  document.getElementById("drawer-driver-license").innerText = `${driver.license} CDL`;
  document.getElementById("drawer-driver-exp").innerText = driver.experience;
  document.getElementById("drawer-driver-safety").innerText = `${driver.safetyScore}%`;
  document.getElementById("drawer-driver-incident").innerText = driver.lastIncident || "No warnings logged.";

  // Status badge update
  const statusEl = document.getElementById("drawer-driver-status");
  statusEl.className = "px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ";
  if (driver.status === "Available") {
    statusEl.classList.add("bg-emerald-950", "border-emerald-800/40", "text-emerald-400");
  } else if (driver.status === "Emergency") {
    statusEl.classList.add("bg-rose-950", "border-rose-800/40", "text-rose-400");
  } else {
    statusEl.classList.add("bg-blue-950", "border-blue-800/40", "text-blue-400");
  }

  // Draw sparklines
  initDriverSparkline(driver.performance || [85, 85, 85, 85, 85]);

  // Place location on map
  // Each driver is mapped to active coordinates in India
  const latMapping = { "Rajesh Kumar": 19.0760, "Amit Patel": 28.6139, "Sanjay Mehta": 12.9716, "Priya Sharma": 22.5726, "Vikram Singh": 13.0827 };
  const lngMapping = { "Rajesh Kumar": 72.8777, "Amit Patel": 77.2090, "Sanjay Mehta": 77.5946, "Priya Sharma": 88.3639, "Vikram Singh": 80.2707 };

  const lat = latMapping[driver.name] || 20.5937;
  const lng = lngMapping[driver.name] || 78.9629;

  initDriverMap(lat, lng);
}

function hideDriverDrawer() {
  const drawer = document.getElementById("driver-detail-drawer");
  drawer.classList.add("translate-x-full");
  setTimeout(() => {
    drawer.classList.add("hidden");
  }, 300);
}

// Render safety performance line sparkline
function initDriverSparkline(performancePoints) {
  if (sparklineChart) {
    sparklineChart.destroy();
  }

  const canvas = document.getElementById("driver-sparkline");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  sparklineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["W1", "W2", "W3", "W4", "W5"],
      datasets: [{
        label: "Safety Factor",
        data: performancePoints,
        borderColor: "#06B6D4",
        backgroundColor: "rgba(6, 182, 212, 0.05)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "#2563EB"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          grid: { color: "rgba(51, 65, 85, 0.2)" },
          ticks: { color: "#94a3b8", font: { size: 9 } }
        }
      }
    }
  });
}

// Driver mini GIS coordinate map tracker
function initDriverMap(lat, lng) {
  if (driverMap) {
    driverMap.remove();
    driverMap = null;
  }

  const container = document.getElementById("driver-mini-map");
  if (!container) return;

  driverMap = L.map("driver-mini-map", {
    zoomControl: false,
    attributionControl: false
  }).setView([lat, lng], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(driverMap);

  const dotIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-5 w-5 rounded-full bg-cyan-400 opacity-40 animate-ping"></span>
        <div class="w-3 h-3 rounded-full bg-cyan-500 border border-white"></div>
      </div>
    `,
    className: "",
    iconSize: [20, 20]
  });

  L.marker([lat, lng], { icon: dotIcon }).addTo(driverMap);
}
