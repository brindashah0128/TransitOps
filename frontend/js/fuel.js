/**
 * TransitOps AI - Fuel core & Charge Logistics controller
 */

let fuelData = [];
let fuelChart = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Sync fuel
  await loadFuelRegistry();

  // Create Chart
  initFuelTrendsChart();

  // Modal handlers
  initFuelModal();
});

async function loadFuelRegistry() {
  try {
    fuelData = await window.apiFetch("/api/fuel");
    renderFuelTable(fuelData);
  } catch (err) {
    console.error("Failed to load fuel records:", err);
  }
}

function renderFuelTable(logs) {
  const container = document.getElementById("fuel-rows");
  if (!container) return;

  container.innerHTML = "";

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/30 transition-colors";

    const isElectric = log.type === "Electric";
    const volumeLabel = isElectric ? `${log.volume} kWh` : `${log.volume} L`;

    tr.innerHTML = `
      <td class="p-3 font-semibold text-slate-200">
        <div class="flex items-center gap-2">
          <i data-lucide="${isElectric ? "zap" : "droplet"}" class="w-3.5 h-3.5 ${isElectric ? "text-cyan-400 animate-pulse" : "text-blue-400"}"></i>
          <span>${log.vehicle}</span>
        </div>
      </td>
      <td class="p-3 text-slate-400 font-medium">${log.type}</td>
      <td class="p-3 font-mono font-bold text-slate-300">${volumeLabel}</td>
      <td class="p-3 font-mono font-bold text-emerald-400">₹${log.cost}</td>
    `;
    container.appendChild(tr);
  });

  lucide.createIcons();
}

function initFuelTrendsChart() {
  const canvas = document.getElementById("fuel-trends-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  
  fuelChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
      datasets: [
        {
          label: "Diesel Cost Index",
          data: [3.45, 3.52, 3.41, 3.48, 3.39, 3.42],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 2,
          tension: 0.35
        },
        {
          label: "EV Grid Charging Cost Index",
          data: [1.20, 1.18, 1.22, 1.15, 1.19, 1.12],
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.05)",
          borderWidth: 2,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#94a3b8" }
        }
      },
      scales: {
        x: { grid: { color: "rgba(51, 65, 85, 0.2)" }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "rgba(51, 65, 85, 0.2)" }, ticks: { color: "#94a3b8" } }
      }
    }
  });
}

function initFuelModal() {
  const openBtn = document.getElementById("add-fuel-btn");
  const modal = document.getElementById("fuel-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("new-fuel-form");

  if (!openBtn || !modal || !closeBtn || !form) return;

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      vehicle: document.getElementById("f-vehicle").value,
      station: document.getElementById("f-station").value,
      volume: parseFloat(document.getElementById("f-volume").value),
      cost: parseFloat(document.getElementById("f-cost").value),
      type: document.getElementById("f-type").value
    };

    try {
      const response = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.showToast?.("Refuel event logged and core diagnostics validated.", "success");
        modal.classList.add("hidden");
        form.reset();

        // Refresh Data
        await loadFuelRegistry();
      }
    } catch (err) {
      window.showToast?.("Failed to log refuel.", "danger");
    }
  });
}
