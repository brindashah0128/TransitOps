/**
 * TransitOps AI - Maintenance Scheduling & Diagnostics controller
 */

let maintenanceData = [];

document.addEventListener("DOMContentLoaded", async () => {
  // Load database
  await loadMaintenanceCatalog();

  // Setup modals
  initMaintenanceModal();
});

async function loadMaintenanceCatalog() {
  try {
    maintenanceData = await window.apiFetch("/api/maintenance");
    renderMaintenanceTable(maintenanceData);
    renderMaintenanceTimeline(maintenanceData);
  } catch (err) {
    console.error("Maintenance load failure:", err);
  }
}

function renderMaintenanceTable(logs) {
  const container = document.getElementById("maintenance-rows");
  if (!container) return;

  container.innerHTML = "";

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/30 transition-colors";

    let statusBg = "bg-blue-950 text-blue-400 border-blue-800/40";
    if (log.status === "Completed") statusBg = "bg-emerald-950 text-emerald-400 border-emerald-800/40";
    if (log.status === "In Progress") statusBg = "bg-amber-950 text-amber-400 border-amber-800/40";

    tr.innerHTML = `
      <td class="p-4 font-semibold text-slate-200">
        <div class="flex items-center gap-2">
          <i data-lucide="tool" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>${log.vehicle}</span>
        </div>
      </td>
      <td class="p-4 text-slate-300 font-medium">${log.type}</td>
      <td class="p-4 font-mono text-slate-400">${log.date}</td>
      <td class="p-4 font-mono font-bold text-slate-200">₹${log.cost}</td>
      <td class="p-4">
        <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusBg}">${log.status}</span>
      </td>
    `;
    container.appendChild(tr);
  });

  lucide.createIcons();
}

function renderMaintenanceTimeline(logs) {
  const container = document.getElementById("maintenance-timeline");
  if (!container) return;

  container.innerHTML = "";

  // Filter latest 4 elements for visual balance
  const timelineLogs = logs.slice(0, 4);

  timelineLogs.forEach((log, index) => {
    const item = document.createElement("div");
    item.className = "flex gap-3 relative";

    const isLast = index === timelineLogs.length - 1;
    const lineHtml = isLast ? "" : `<span class="absolute top-5 left-2 bottom-0 w-0.5 bg-slate-800"></span>`;

    let colorClass = "bg-blue-500";
    if (log.status === "Completed") colorClass = "bg-emerald-500";
    if (log.status === "In Progress") colorClass = "bg-amber-500";

    item.innerHTML = `
      ${lineHtml}
      <div class="w-4 h-4 rounded-full ${colorClass} border-2 border-slate-900 flex items-center justify-center flex-shrink-0 z-10">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
      </div>
      <div class="text-xs">
        <span class="font-bold text-slate-200 block">${log.vehicle} - ${log.type}</span>
        <p class="text-[10px] text-slate-500 mt-0.5">${log.notes || "Standard mechanical diagnosis protocol"}</p>
        <span class="text-[9px] text-slate-400 font-bold block mt-1 uppercase font-mono">${log.date}</span>
      </div>
    `;
    container.appendChild(item);
  });

  lucide.createIcons();
}

function initMaintenanceModal() {
  const openBtn = document.getElementById("add-schedule-btn");
  const modal = document.getElementById("service-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("new-maintenance-form");

  if (!openBtn || !modal || !closeBtn || !form) return;

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      vehicle: document.getElementById("m-vehicle").value,
      type: document.getElementById("m-type").value,
      date: document.getElementById("m-date").value,
      cost: parseFloat(document.getElementById("m-cost").value),
      notes: document.getElementById("m-notes").value,
      status: "Scheduled"
    };

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.showToast?.("Service ticket opened. Asset queued for workshop.", "success");
        modal.classList.add("hidden");
        form.reset();

        // Reload data
        await loadMaintenanceCatalog();
      }
    } catch (err) {
      window.showToast?.("Ticket opening failed.", "danger");
    }
  });
}
