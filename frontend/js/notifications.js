/**
 * TransitOps AI - Operations Alert Center controller
 */

let notificationsData = [];

document.addEventListener("DOMContentLoaded", async () => {
  // Sync alerts from backend
  await loadNotificationsConsole();

  // Bind Tab filters
  const tabButtons = document.querySelectorAll(".alert-tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active class
      tabButtons.forEach(b => b.className = "alert-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200");
      btn.className = "alert-tab-btn active px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white";

      const filterVal = btn.getAttribute("data-filter");
      filterAlertsList(filterVal);
    });
  });

  // Bind dismissal button
  const clearBtn = document.getElementById("clear-notifications-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("notifications-list-container").innerHTML = `
        <div class="p-8 text-center text-slate-500">
          <div class="flex flex-col items-center gap-2">
            <i data-lucide="bell-off" class="w-8 h-8"></i>
            <span>All active alerts dismissed successfully.</span>
          </div>
        </div>
      `;
      lucide.createIcons();
      window.showToast?.("Operational alert log cleared.", "success");
    });
  }
});

async function loadNotificationsConsole() {
  try {
    notificationsData = await window.apiFetch("/api/notifications");
    renderAlertsList(notificationsData);
  } catch (err) {
    console.error("Alerts sync failure:", err);
  }
}

function renderAlertsList(alerts) {
  const container = document.getElementById("notifications-list-container");
  if (!container) return;

  container.innerHTML = "";

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500">
        <div class="flex flex-col items-center gap-2">
          <i data-lucide="check" class="w-8 h-8"></i>
          <span>No active notifications.</span>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  alerts.forEach(alert => {
    const item = document.createElement("div");
    item.className = "p-4.5 hover:bg-slate-800/25 transition-colors flex gap-4 items-start";

    // Icon matching priority
    let iconName = "alert-triangle";
    let iconColorClass = "text-amber-400";
    let alertLabel = "Warning";
    
    if (alert.type === "critical") {
      iconName = "zap";
      iconColorClass = "text-rose-400 animate-pulse";
      alertLabel = "Critical Exception";
    }

    item.innerHTML = `
      <div class="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center flex-shrink-0">
        <i data-lucide="${iconName}" class="w-5 h-5 ${iconColorClass}"></i>
      </div>
      <div class="flex-1 text-xs">
        <div class="flex items-center justify-between pb-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-200">${alert.title}</span>
            <span class="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded uppercase tracking-wider ${alert.type === "critical" ? "bg-rose-950/50 text-rose-400 border border-rose-800/30" : "bg-amber-950/50 text-amber-400 border border-amber-800/30"}">${alertLabel}</span>
          </div>
          <span class="text-slate-500 text-[10px] font-semibold">${alert.time}</span>
        </div>
        <p class="text-slate-400 leading-relaxed mt-0.5">${alert.text}</p>
      </div>
    `;
    container.appendChild(item);
  });

  lucide.createIcons();
}

function filterAlertsList(priority) {
  if (priority === "ALL") {
    renderAlertsList(notificationsData);
  } else {
    const filtered = notificationsData.filter(a => a.type === priority);
    renderAlertsList(filtered);
  }
}
