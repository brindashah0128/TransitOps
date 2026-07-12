/**
 * TransitOps AI - Dispatcher Profile controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-details-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("profile-email")?.value;
      const phone = document.getElementById("profile-phone")?.value;

      // Update cached state if needed, or simply display success toast
      window.showToast?.("Dispatcher parameters updated successfully.", "success");
    });
  }

  // Handle Token Request
  const tokenBtn = document.getElementById("generate-token-btn");
  if (tokenBtn) {
    tokenBtn.addEventListener("click", () => {
      const chars = "abcdef0123456789";
      let randomHex = "";
      for (let i = 0; i < 32; i++) {
        randomHex += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const generatedToken = `transitops_sha256_${randomHex.substring(0, 16)}`;

      // Append security log
      const logContainer = document.getElementById("audit-log-container");
      if (logContainer) {
        const div = document.createElement("div");
        div.className = "p-3 rounded bg-[#1E293B] border border-slate-800 flex justify-between items-center animate-pulse";
        div.innerHTML = `
          <div>
            <span class="font-bold text-slate-200">API Integration Access Token Generated</span>
            <p class="text-[10px] text-cyan-400 font-mono mt-0.5">Token: ${generatedToken}</p>
          </div>
          <span class="font-mono text-slate-500 text-[10px]">Just now</span>
        `;
        logContainer.insertBefore(div, logContainer.firstChild);

        // Remove pulse after 2s
        setTimeout(() => {
          div.classList.remove("animate-pulse");
        }, 2000);
      }

      window.showToast?.("Integration credentials generated. Keep secure.", "success");
    });
  }
});
