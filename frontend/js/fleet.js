/**
 * TransitOps AI - Dedicated Full Screen Telematics Live Monitor
 */

let fleetMap = null;
let currentActiveMarker = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Sync registry and initialize GIS Tracking map
  await loadFleetMonitor();

  const closeTelemBtn = document.getElementById("close-telem-btn");
  if (closeTelemBtn) {
    closeTelemBtn.addEventListener("click", hideTelemPanel);
  }
});

async function loadFleetMonitor() {
  const mapContainer = document.getElementById("fleet-live-map");
  if (!mapContainer) return;

  // Render centered broadly on India Bounds
  fleetMap = L.map("fleet-live-map", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(fleetMap);

  try {
    const vehicles = await window.apiFetch("/api/vehicles");
    
    // Spawn vehicle coordinate marker icons on map
    vehicles.forEach(vehicle => {
      // Determine marker color matching specifications:
      // Green -> Available, Blue -> On Trip, Orange -> Maintenance, Red -> Emergency
      let statusColor = "#2563EB"; // Blue default (On Trip)
      if (vehicle.status === "Available") statusColor = "#22C55E"; // Green
      if (vehicle.status === "Maintenance") statusColor = "#F59E0B"; // Orange
      if (vehicle.status === "Emergency") statusColor = "#EF4444"; // Red

      const svgIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full opacity-20 animate-pulse" style="background-color: ${statusColor}"></span>
            <div class="w-5 h-5 rounded-full border-2 border-[#0F172A] flex items-center justify-center shadow-2xl" style="background-color: ${statusColor}">
              <i data-lucide="truck" class="w-3 h-3 text-white"></i>
            </div>
          </div>
        `,
        className: "",
        iconSize: [32, 32]
      });

      const marker = L.marker([vehicle.lat, vehicle.lng], { icon: svgIcon }).addTo(fleetMap);
      
      // Marker triggers right diagnostics slider panel
      marker.on("click", () => {
        showTelemPanel(vehicle);
      });
    });

  } catch (err) {
    console.error("Failed to fetch telematics catalog:", err);
  }

  // Draw Lucide icons on map divestments
  setTimeout(() => {
    fleetMap.invalidateSize();
    lucide.createIcons();
  }, 400);
}

// Reveal Telematics Slide-In Card on Right Panel
function showTelemPanel(vehicle) {
  const panel = document.getElementById("fleet-telem-panel");
  panel.classList.remove("hidden");
  
  // Bind dynamic metrics
  document.getElementById("telem-vehicle-id").innerText = vehicle.id;
  document.getElementById("telem-vehicle-name").innerText = vehicle.name;
  document.getElementById("telem-driver").innerText = vehicle.driver;
  document.getElementById("telem-speed").innerText = `${vehicle.speed} km/h`;
  document.getElementById("telem-trip").innerText = vehicle.trip === "None" ? "Idle - At Station Depot" : vehicle.trip;
  document.getElementById("telem-eta").innerText = vehicle.eta === "N/A" ? "" : `ETA ${vehicle.eta}`;
  
  // Handle Fuel Levels
  let fuelVolume = "78%";
  let isElectric = vehicle.fuel === "Electric" || vehicle.type.includes("EV");
  if (isElectric) {
    fuelVolume = "87% State-of-Charge";
    document.getElementById("telem-fuel-bar").className = "h-full bg-cyan-400 rounded-full";
    document.getElementById("telem-fuel-bar").style.width = "87%";
  } else {
    fuelVolume = "55% Diesel Tank";
    document.getElementById("telem-fuel-bar").className = "h-full bg-blue-500 rounded-full";
    document.getElementById("telem-fuel-bar").style.width = "55%";
  }
  document.getElementById("telem-fuel").innerText = fuelVolume;

  // Handle Vibration and Diagnostics
  const vibrationEl = document.getElementById("telem-vibration");
  if (vehicle.id === "v-01") {
    vibrationEl.innerText = "8.4 Hz [Pump Vibration High]";
    vibrationEl.className = "text-rose-400 font-bold font-mono";
  } else if (vehicle.id === "v-06") {
    vibrationEl.innerText = "9.8 Hz [Exhaust Core Sensor Error]";
    vibrationEl.className = "text-rose-400 font-bold font-mono";
  } else {
    vibrationEl.innerText = "1.2 Hz [Normal Amplitude]";
    vibrationEl.className = "text-emerald-400 font-semibold font-mono";
  }

  // Pan map center on selected marker
  fleetMap.setView([vehicle.lat, vehicle.lng], 6);
}

function hideTelemPanel() {
  const panel = document.getElementById("fleet-telem-panel");
  panel.classList.add("hidden");
}
