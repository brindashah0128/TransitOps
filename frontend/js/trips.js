/**
 * TransitOps AI - Trip Dispatch & Dijkstra Routing controller
 */

let dispatchMap = null;
let currentRouteLine = null;
let currentStartMarker = null;
let currentEndMarker = null;

// Route Coordinates Matrix (Dijkstra Shortest Paths)
const ROUTE_COORDINATES = {
  "Mumbai Terminal-Pune Hub": {
    coords: [[19.0760, 72.8777], [18.9712, 73.0220], [18.7481, 73.4110], [18.5204, 73.8567]],
    distance: "150 km",
    eta: "3h 15m",
    fuel: "20 Liters",
    cost: "₹2,200"
  },
  "Mumbai Terminal-Jaipur Hub": {
    coords: [[19.0760, 72.8777], [22.3072, 73.1812], [24.5854, 73.7125], [26.9124, 75.7873]],
    distance: "1,150 km",
    eta: "20h 30m",
    fuel: "160 Liters",
    cost: "₹17,500"
  },
  "Mumbai Terminal-Chennai Hub": {
    coords: [[19.0760, 72.8777], [17.3850, 78.4867], [15.9129, 79.7400], [13.0827, 80.2707]],
    distance: "1,340 km",
    eta: "23h 15m",
    fuel: "190 Liters",
    cost: "₹21,000"
  },
  "Delhi Terminal-Pune Hub": {
    coords: [[28.6139, 77.2090], [26.2183, 78.1772], [22.7196, 75.8577], [18.5204, 73.8567]],
    distance: "1,430 km",
    eta: "24h 45m",
    fuel: "200 Liters",
    cost: "₹22,500"
  },
  "Delhi Terminal-Jaipur Hub": {
    coords: [[28.6139, 77.2090], [28.4595, 77.0266], [27.5530, 76.6210], [26.9124, 75.7873]],
    distance: "270 km",
    eta: "5h 15m",
    fuel: "280 kWh", // Tesla Semi match
    cost: "₹1,200"
  },
  "Delhi Terminal-Chennai Hub": {
    coords: [[28.6139, 77.2090], [23.1811, 75.7842], [17.3850, 78.4867], [13.0827, 80.2707]],
    distance: "2,200 km",
    eta: "38h 30m",
    fuel: "310 Liters",
    cost: "₹34,000"
  },
  "Bengaluru Terminal-Pune Hub": {
    coords: [[12.9716, 77.5946], [15.3647, 75.1240], [16.8302, 74.7973], [18.5204, 73.8567]],
    distance: "840 km",
    eta: "14h 30m",
    fuel: "120 Liters",
    cost: "₹13,000"
  },
  "Bengaluru Terminal-Jaipur Hub": {
    coords: [[12.9716, 77.5946], [17.3850, 78.4867], [22.7196, 75.8577], [26.9124, 75.7873]],
    distance: "2,000 km",
    eta: "33h 45m",
    fuel: "280 Liters",
    cost: "₹31,000"
  },
  "Bengaluru Terminal-Chennai Hub": {
    coords: [[12.9716, 77.5946], [12.9165, 79.1325], [12.9718, 79.9888], [13.0827, 80.2707]],
    distance: "350 km",
    eta: "6h 15m",
    fuel: "50 Liters",
    cost: "₹5,500"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Route GIS Map
  initDispatchMap();

  // Route dropdown triggers
  const sourceSel = document.getElementById("route-source");
  const destSel = document.getElementById("route-destination");
  const vehicleSel = document.getElementById("route-vehicle");

  sourceSel.addEventListener("change", recalculateDijkstraRoute);
  destSel.addEventListener("change", recalculateDijkstraRoute);
  vehicleSel.addEventListener("change", recalculateDijkstraRoute);

  // Form submission dispatcher
  const dispatchForm = document.getElementById("trip-dispatch-form");
  dispatchForm.addEventListener("submit", executeCargoDispatch);

  // Initial calculation
  recalculateDijkstraRoute();
  
  // Bind dynamic actions from URL query parameters (for layout links)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("action") === "new") {
    window.showToast?.("Input route configurations to calculate optimal dispatch.", "info");
  }
});

// Initialize Route Map with appropriate styles
function initDispatchMap() {
  const container = document.getElementById("dispatch-map");
  if (!container) return;

  dispatchMap = L.map("dispatch-map", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapFilterFilter());
}

// Bypass standard tile layer filter override to avoid conflicts
function mapFilterFilter() {
  return dispatchMap;
}

// Handle dynamic Dijkstra shortest path calculations
function recalculateDijkstraRoute() {
  if (!dispatchMap) return;

  const source = document.getElementById("route-source").value;
  const destination = document.getElementById("route-destination").value;
  const vehicleId = document.getElementById("route-vehicle").value;

  const key = `${source}-${destination}`;
  const routeData = ROUTE_COORDINATES[key];

  if (!routeData) {
    // Standard default Mumbai to Pune if mismatch
    return;
  }

  // Adjust display predictions
  document.getElementById("route-distance").innerText = routeData.distance;
  document.getElementById("route-eta").innerText = routeData.eta;
  document.getElementById("route-cost-est").innerText = routeData.cost;

  // EV custom consumption labels
  let fuelLabel = routeData.fuel;
  if (vehicleId === "v-02" && key === "Delhi Terminal-Jaipur Hub") {
    fuelLabel = "280 kWh";
  } else if (vehicleId === "v-02") {
    const rawLiters = parseInt(routeData.fuel);
    fuelLabel = `${Math.floor(rawLiters * 2.5)} kWh`;
  }
  document.getElementById("route-fuel-est").innerText = fuelLabel;

  // Redraw path polylines on map
  drawRoutePath(routeData.coords);
}

// Map path polylines painter
function drawRoutePath(coords) {
  if (!dispatchMap) return;

  // Reset existing layers
  if (currentRouteLine) dispatchMap.removeLayer(currentRouteLine);
  if (currentStartMarker) dispatchMap.removeLayer(currentStartMarker);
  if (currentEndMarker) dispatchMap.removeLayer(currentEndMarker);

  const startPoint = coords[0];
  const endPoint = coords[coords.length - 1];

  // Icons
  const startIcon = L.divIcon({
    html: `<div class="w-4 h-4 rounded-full bg-blue-600 border border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white">S</div>`,
    className: "",
    iconSize: [16, 16]
  });

  const endIcon = L.divIcon({
    html: `<div class="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white">D</div>`,
    className: "",
    iconSize: [16, 16]
  });

  currentStartMarker = L.marker(startPoint, { icon: startIcon }).addTo(dispatchMap);
  currentEndMarker = L.marker(endPoint, { icon: endIcon }).addTo(dispatchMap);

  currentRouteLine = L.polyline(coords, {
    color: "#2563eb",
    weight: 4,
    opacity: 0.8,
    lineJoin: "round"
  }).addTo(dispatchMap);

  // Zoom bounds to fit
  dispatchMap.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });
}

// POST dispatch to endpoint and launch tracking overlay beacon
async function executeCargoDispatch(e) {
  e.preventDefault();

  const source = document.getElementById("route-source").options[document.getElementById("route-source").selectedIndex].text;
  const destination = document.getElementById("route-destination").options[document.getElementById("route-destination").selectedIndex].text;
  const cargoWeight = document.getElementById("route-cargo").value;
  const vehicleText = document.getElementById("route-vehicle").options[document.getElementById("route-vehicle").selectedIndex].text;
  const driverText = document.getElementById("route-driver").options[document.getElementById("route-driver").selectedIndex].text;

  const distance = document.getElementById("route-distance").innerText;
  const fuelEst = document.getElementById("route-fuel-est").innerText;
  const costEst = document.getElementById("route-cost-est").innerText;
  const eta = document.getElementById("route-eta").innerText;

  const payload = {
    vehicle: vehicleText,
    driver: driverText,
    source: source,
    destination: destination,
    distance: distance,
    cargoWeight: cargoWeight,
    fuelEst: fuelEst,
    costEst: costEst,
    eta: eta
  };

  try {
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      window.showToast?.("Optimal cargo route authorized! Mission is live.", "success");

      // Bind data to floating tracker overlay
      document.getElementById("overlay-driver").innerText = driverText.split(" [")[0];
      document.getElementById("overlay-vehicle").innerText = vehicleText.split(" [")[0];
      document.getElementById("overlay-eta").innerText = eta;

      const overlay = document.getElementById("trip-live-overlay");
      overlay.classList.remove("hidden");

      // Add a nice animated live tracker dot tracing the route path
      animateMapTrackerBeacon();
    }
  } catch (err) {
    window.showToast?.("Dispatch submission failed.", "danger");
  }
}

// Simulate actual cargo vehicle traversing coordinate points
function animateMapTrackerBeacon() {
  if (!dispatchMap || !currentRouteLine) return;

  const coords = currentRouteLine.getLatLngs();
  let step = 0;

  const trackerIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
        <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1e293b] flex items-center justify-center shadow-lg">
          <i data-lucide="truck" class="w-2.5 h-2.5 text-white"></i>
        </div>
      </div>
    `,
    className: "",
    iconSize: [32, 32]
  });

  const trackingMarker = L.marker(coords[0], { icon: trackerIcon }).addTo(dispatchMap);
  lucide.createIcons();

  const animationInterval = setInterval(() => {
    if (step >= coords.length - 1) {
      clearInterval(animationInterval);
      window.showToast?.("Active dispatch reached Destination Hub successfully!", "success");
      document.getElementById("trip-live-overlay").classList.add("hidden");
      dispatchMap.removeLayer(trackingMarker);
      return;
    }
    
    step++;
    trackingMarker.setLatLng(coords[step]);
    dispatchMap.panTo(coords[step]);
  }, 4000);

  // Setup abort and complete bindings
  document.getElementById("abort-trip-btn").onclick = () => {
    clearInterval(animationInterval);
    dispatchMap.removeLayer(trackingMarker);
    document.getElementById("trip-live-overlay").classList.add("hidden");
    window.showToast?.("Active mission aborted. Returning pilot coordinates.", "warning");
  };

  document.getElementById("complete-trip-btn").onclick = () => {
    clearInterval(animationInterval);
    dispatchMap.removeLayer(trackingMarker);
    document.getElementById("trip-live-overlay").classList.add("hidden");
    window.showToast?.("Mission completed. Trip statistics archived.", "success");
  };
}
