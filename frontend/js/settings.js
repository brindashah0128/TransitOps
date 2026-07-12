/**
 * TransitOps AI - System Configurations controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-conn-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const host = document.getElementById("conn-host")?.value;
      const port = document.getElementById("conn-port")?.value;
      const submitBtn = form.querySelector("button[type='submit']");

      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="flex items-center justify-center gap-2">
            <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
            <span>Pinging Telemetry Host...</span>
          </div>
        `;
        lucide.createIcons();

        // Simulate server validation delay
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          lucide.createIcons();
          
          window.showToast?.(`Connection to ${host}:${port} validated and secured with AES-256 handshake.`, "success");
        }, 1500);
      }
    });
  }

  // Handle toggle triggers
  const dijkstraToggle = document.getElementById("toggle-dijkstra");
  const vibrationToggle = document.getElementById("toggle-vibration");
  const smsToggle = document.getElementById("toggle-sms");

  if (dijkstraToggle) {
    dijkstraToggle.addEventListener("change", () => {
      const state = dijkstraToggle.checked ? "Activated" : "Deactivated";
      window.showToast?.(`Autonomous Dijkstra Pathfinding ${state}.`, "info");
    });
  }

  if (vibrationToggle) {
    vibrationToggle.addEventListener("change", () => {
      const state = vibrationToggle.checked ? "Activated" : "Deactivated";
      window.showToast?.(`AI Impeller Vibration Predictor ${state}.`, "info");
    });
  }

  if (smsToggle) {
    smsToggle.addEventListener("change", () => {
      const state = smsToggle.checked ? "Activated" : "Deactivated";
      window.showToast?.(`CDL Pilot SMS Alerts ${state}.`, "info");
    });
  }
});
