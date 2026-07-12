/**
 * TransitOps AI - Vehicle Registry Operations controller
 */

let vehiclesData = [];
let drawerMap = null;
let currentOpenVehicle = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Sync registry from backend
  await loadVehiclesRegistry();

  // Attach search and filter callbacks
  const searchInput = document.getElementById("vehicle-search");
  const filterType = document.getElementById("vehicle-filter-type");
  const filterStatus = document.getElementById("vehicle-filter-status");

  searchInput.addEventListener("input", filterVehiclesList);
  filterType.addEventListener("change", filterVehiclesList);
  filterStatus.addEventListener("change", filterVehiclesList);

  // Setup modal triggers
  initVehicleCommissionModal();

  // Setup drawer dismiss
  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", hideVehicleDrawer);
  }
});

// Load raw assets list from API
async function loadVehiclesRegistry() {
  try {
    vehiclesData = await window.apiFetch("/api/vehicles");
    renderVehiclesList(vehiclesData);
  } catch (err) {
    console.error("Vehicles loading failure:", err);
  }
}

// Render vehicle tabular cells dynamically
function renderVehiclesList(vehicles) {
  const container = document.getElementById("vehicles-table-rows");
  if (!container) return;

  container.innerHTML = "";
  document.getElementById("visible-count").innerText = vehicles.length;

  if (vehicles.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" class="p-8 text-center text-slate-500">
          <div class="flex flex-col items-center gap-2">
            <i data-lucide="info" class="w-8 h-8"></i>
            <span>No vehicles match the selected operations filter.</span>
          </div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  vehicles.forEach(vehicle => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/40 transition-colors duration-150 cursor-pointer";
    tr.addEventListener("click", () => showVehicleDrawer(vehicle));

    // Determine status design elements
    let statusBg = "bg-blue-950 text-blue-400 border-blue-800/50";
    if (vehicle.status === "Available") statusBg = "bg-emerald-950 text-emerald-400 border-emerald-800/50";
    if (vehicle.status === "Maintenance") statusBg = "bg-amber-950 text-amber-400 border-amber-800/50";
    if (vehicle.status === "Emergency") statusBg = "bg-rose-950 text-rose-400 border-rose-800/50";

    // Determine health score color class
    let healthColor = "text-emerald-400";
    if (vehicle.health < 80) healthColor = "text-amber-400";
    if (vehicle.health < 50) healthColor = "text-rose-400";

    tr.innerHTML = `
      <td class="p-4 font-semibold text-slate-200">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded bg-slate-900 border border-slate-800">
            <i data-lucide="${vehicle.type.includes("EV") ? "battery-charging" : "truck"}" class="w-4 h-4 text-slate-400"></i>
          </div>
          <div>
            <span class="block">${vehicle.name}</span>
            <span class="text-[10px] text-slate-500 font-normal block">${vehicle.type}</span>
          </div>
        </div>
      </td>
      <td class="p-4 font-mono font-bold text-slate-400">${vehicle.reg}</td>
      <td class="p-4">${vehicle.fuel}</td>
      <td class="p-4 font-medium">${vehicle.driver}</td>
      <td class="p-4 text-slate-400">${vehicle.trip}</td>
      <td class="p-4 font-bold font-mono ${healthColor}">${vehicle.health}%</td>
      <td class="p-4">
        <span class="px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusBg}">${vehicle.status}</span>
      </td>
      <td class="p-4 text-right">
        <button class="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition duration-150" onclick="event.stopPropagation(); showVehicleDrawer(${JSON.stringify(vehicle).replace(/"/g, '&quot;')})">
          <i data-lucide="eye" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    container.appendChild(tr);
  });

  lucide.createIcons();
}

// Client-side search and propulsion filtering
function filterVehiclesList() {
  const query = document.getElementById("vehicle-search").value.toLowerCase();
  const fuelFilter = document.getElementById("vehicle-filter-type").value;
  const statusFilter = document.getElementById("vehicle-filter-status").value;

  const filtered = vehiclesData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(query) || 
                          v.reg.toLowerCase().includes(query) || 
                          v.driver.toLowerCase().includes(query);
    const matchesFuel = fuelFilter === "ALL" || v.fuel === fuelFilter;
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;

    return matchesSearch && matchesFuel && matchesStatus;
  });

  renderVehiclesList(filtered);
}

// Show right-side Sliding Specs panel with Leaflet Mini-map
function showVehicleDrawer(vehicle) {
  currentOpenVehicle = vehicle;
  const drawer = document.getElementById("vehicle-detail-drawer");
  drawer.classList.remove("hidden");
  
  // Quick timeout to let DOM un-hide for transition
  setTimeout(() => {
    drawer.classList.remove("translate-x-full");
  }, 10);

  // Bind parameters
  document.getElementById("drawer-vehicle-id").innerText = vehicle.id;
  document.getElementById("drawer-vehicle-name").innerText = vehicle.name;
  document.getElementById("drawer-vehicle-type").innerText = vehicle.type;
  document.getElementById("drawer-vehicle-regstatus").innerText = vehicle.regStatus;
  document.getElementById("drawer-vehicle-insurance").innerText = vehicle.insurance;

  // Bind image placeholders (alternates between truck categories)
  const imgEl = document.getElementById("drawer-vehicle-image");
  if (vehicle.type.includes("EV") || vehicle.fuel === "Electric") {
    imgEl.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&h=200&q=80"; // Tesla Semi or clean look
  } else {
    imgEl.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&h=200&q=80"; // standard heavy truck
  }

  // Populate dynamic documents list
  const docsContainer = document.getElementById("drawer-vehicle-docs");
  docsContainer.innerHTML = "";
  vehicle.docs.forEach(doc => {
    const div = document.createElement("div");
    div.className = "p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs";
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <i data-lucide="file-check" class="w-4 h-4 text-cyan-400"></i>
        <span class="font-semibold">${doc}</span>
      </div>
      <button class="text-blue-400 hover:underline">View File</button>
    `;
    docsContainer.appendChild(div);
  });
  
  lucide.createIcons();

  // Instantiate mini Leaflet location tracker
  initDrawerMiniMap(vehicle.lat, vehicle.lng, vehicle.name);
}

function hideVehicleDrawer() {
  const drawer = document.getElementById("vehicle-detail-drawer");
  drawer.classList.add("translate-x-full");
  setTimeout(() => {
    drawer.classList.add("hidden");
  }, 300);
}

// Drawer Map instantiator
function initDrawerMiniMap(lat, lng, name) {
  // Clear old map instance
  if (drawerMap) {
    drawerMap.remove();
    drawerMap = null;
  }

  const mapContainer = document.getElementById("drawer-mini-map");
  if (!mapContainer) return;

  drawerMap = L.map("drawer-mini-map", {
    zoomControl: false,
    attributionControl: false
  }).setView([lat, lng], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(drawerMap);

  // Custom marker
  const dotIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-5 w-5 rounded-full bg-blue-400 opacity-40 animate-ping"></span>
        <div class="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
      </div>
    `,
    className: "",
    iconSize: [20, 20]
  });

  L.marker([lat, lng], { icon: dotIcon }).addTo(drawerMap);
}

// Commission Vehicle Form Handler
function initVehicleCommissionModal() {
  const openBtn = document.getElementById("add-vehicle-btn");
  const modal = document.getElementById("vehicle-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("new-vehicle-form");

  if (!openBtn || !modal || !closeBtn || !form) return;

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  // Form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("modal-model-name").value,
      reg: document.getElementById("modal-plate").value,
      capacity: document.getElementById("modal-capacity").value,
      fuel: document.getElementById("modal-propulsion").value,
      type: document.getElementById("modal-type").value
    };

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.showToast?.("New vehicle asset authorized and logged successfully!", "success");
        modal.classList.add("hidden");
        form.reset();
        
        // Re-sync catalog
        await loadVehiclesRegistry();
      } else {
        throw new Error("Creation failed");
      }
    } catch (err) {
      window.showToast?.("Commission request failed. Verify network.", "danger");
    }
  });
}
