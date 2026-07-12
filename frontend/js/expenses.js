/**
 * TransitOps AI - Operations ledger & Expenses controller
 */

let expensesData = [];
let doughnutChart = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Load initial ledger data
  await loadExpensesLedger();

  // Modal binding
  initExpenseModal();
});

async function loadExpensesLedger() {
  try {
    expensesData = await window.apiFetch("/api/expenses");
    renderLedgerTable(expensesData);
    initExpenseDoughnut(expensesData);
  } catch (err) {
    console.error("Failed to load expenses database:", err);
  }
}

function renderLedgerTable(items) {
  const container = document.getElementById("ledger-rows");
  if (!container) return;

  container.innerHTML = "";

  items.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/30 transition-colors";

    tr.innerHTML = `
      <td class="p-3 font-semibold text-slate-200">
        <div class="flex items-center gap-2">
          <i data-lucide="receipt" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>${item.desc || "Operational Overhead"}</span>
        </div>
      </td>
      <td class="p-3 text-slate-400 font-medium">${item.category || "Other"}</td>
      <td class="p-3 font-mono text-slate-400">${item.date || "N/A"}</td>
      <td class="p-3 font-mono font-bold text-rose-400">₹${(item.cost || 0).toLocaleString()}</td>
    `;
    container.appendChild(tr);
  });

  lucide.createIcons();
}

function initExpenseDoughnut(items) {
  const canvas = document.getElementById("expenses-doughnut-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Sum categories
  const categoriesMap = { "Fuel": 0, "Salaries": 0, "Maintenance": 0, "Tolls": 0 };
  items.forEach(item => {
    if (categoriesMap[item.category] !== undefined) {
      categoriesMap[item.category] += (item.cost || 0);
    }
  });

  const chartData = {
    labels: Object.keys(categoriesMap),
    datasets: [{
      data: Object.values(categoriesMap),
      backgroundColor: ["#2563EB", "#06B6D4", "#F59E0B", "#EF4444"],
      borderWidth: 2,
      borderColor: "#1e293b"
    }]
  };

  if (doughnutChart) {
    doughnutChart.destroy();
  }

  doughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#94a3b8", font: { family: "Inter", size: 10 } }
        }
      },
      cutout: "70%"
    }
  });
}

function initExpenseModal() {
  const openBtn = document.getElementById("add-expense-btn");
  const modal = document.getElementById("expense-modal");
  const closeBtn = document.getElementById("close-modal-btn");
  const form = document.getElementById("new-expense-form");

  if (!openBtn || !modal || !closeBtn || !form) return;

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      desc: document.getElementById("e-desc").value,
      category: document.getElementById("e-category").value,
      cost: parseFloat(document.getElementById("e-cost").value),
      date: document.getElementById("e-date").value
    };

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.showToast?.("Overhead transaction filed into operational ledger.", "success");
        modal.classList.add("hidden");
        form.reset();

        // Refresh Ledger
        await loadExpensesLedger();
      }
    } catch (err) {
      window.showToast?.("Transaction log failed.", "danger");
    }
  });
}
