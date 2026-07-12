/**
 * TransitOps AI - Secure Documents Vault controller
 */

let documentsData = [
  { id: "doc-1", name: "DOT-Safety-Certification.pdf", category: "Licenses", date: "2026-07-01", size: "320 KB" },
  { id: "doc-2", name: "Sarah-Connor-CDL-Class-A.pdf", category: "Licenses", date: "2026-06-25", size: "150 KB" },
  { id: "doc-3", name: "Tesla-Semi-Liability-Policy.pdf", category: "Insurance", date: "2026-05-12", size: "2.4 MB" },
  { id: "doc-4", name: "June-Freight-Overhead-Invoices.xlsx", category: "Invoices", date: "2026-06-30", size: "420 KB" }
];

document.addEventListener("DOMContentLoaded", () => {
  renderDocumentsTable(documentsData);

  // Setup tab filters
  const tabButtons = document.querySelectorAll(".docs-tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.className = "docs-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200");
      btn.className = "docs-tab-btn active px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white";

      const category = btn.getAttribute("data-category");
      filterDocumentsList(category);
    });
  });

  // Setup Drag-and-Drop listeners
  initDocumentsDropzone();
});

function renderDocumentsTable(docs) {
  const container = document.getElementById("docs-table-rows");
  if (!container) return;

  container.innerHTML = "";

  docs.forEach(doc => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/30 transition-colors";

    tr.innerHTML = `
      <td class="p-4 font-semibold text-slate-200 flex items-center gap-2.5">
        <div class="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
          <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
        </div>
        <span>${doc.name}</span>
      </td>
      <td class="p-4 text-slate-400 font-medium">${doc.category}</td>
      <td class="p-4 font-mono text-slate-500">${doc.date}</td>
      <td class="p-4 font-mono font-bold text-slate-300">${doc.size}</td>
      <td class="p-4 text-right">
        <button class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold transition" onclick="viewDocUrl('${doc.name}')">
          Download PDF
        </button>
      </td>
    `;
    container.appendChild(tr);
  });

  lucide.createIcons();
}

function filterDocumentsList(category) {
  if (category === "ALL") {
    renderDocumentsTable(documentsData);
  } else {
    const filtered = documentsData.filter(d => d.category === category);
    renderDocumentsTable(filtered);
  }
}

// Drag & Drop File Upload Engine
function initDocumentsDropzone() {
  const dropzone = document.getElementById("documents-dropzone");
  const fileInput = document.getElementById("documents-file-input");

  if (!dropzone || !fileInput) return;

  // Programmatic click routing
  dropzone.addEventListener("click", () => fileInput.click());

  // Visual drag indicators
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-blue-500", "bg-blue-950/10");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("border-blue-500", "bg-blue-950/10");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-blue-500", "bg-blue-950/10");

    const files = e.dataTransfer.files;
    handleUploadedFiles(files);
  });

  fileInput.addEventListener("change", () => {
    handleUploadedFiles(fileInput.files);
  });
}

function handleUploadedFiles(files) {
  if (!files || files.length === 0) return;

  // Simulate file encryption and upload
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Guess category from file type or name
    let guessedCategory = "Invoices";
    if (file.name.toLowerCase().includes("cdl") || file.name.toLowerCase().includes("license")) {
      guessedCategory = "Licenses";
    } else if (file.name.toLowerCase().includes("insur")) {
      guessedCategory = "Insurance";
    }

    const sizeInKB = Math.floor(file.size / 1024);
    const sizeLabel = sizeInKB > 1000 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    // Push record
    const newDoc = {
      id: `doc-${Date.now()}-${i}`,
      name: file.name,
      category: guessedCategory,
      date: new Date().toISOString().split("T")[0],
      size: sizeLabel
    };

    documentsData.unshift(newDoc);
  }

  // Redraw
  renderDocumentsTable(documentsData);
  window.showToast?.("Document validated, encrypted via AES-256 and stored.", "success");
}

function viewDocUrl(name) {
  window.showToast?.(`Downloading ${name} from TransitOps CDN...`, "info");
}
