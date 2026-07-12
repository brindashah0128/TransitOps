/**
 * TransitOps AI - Layout Reusable Component
 * Dynamically wraps web views with an enterprise-grade Sidebar, Top Navbar, 
 * Floating AI quick actions, responsive mobile controls, and state persistence.
 */

// Apply theme immediately on script execution to prevent flickering before DOM renders
(() => {
  const storedTheme = localStorage.getItem("theme") || "dark";
  if (storedTheme === "light") {
    document.documentElement.classList.add("light-theme");
  }
})();

// Shared API call utility
window.apiFetch = async function(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Exception:", error);
    window.showToast?.(`Failed to retrieve data from ${url}`, "danger");
    throw error;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Check auth - exclude index.html (which is our Login page)
  const isLoginPage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");
  const token = localStorage.getItem("transit_jwt_token");

  if (!isLoginPage && !token) {
    // Redirect to login
    window.location.href = "index.html";
    return;
  }

  // Get current page name to mark active
  const pathParts = window.location.pathname.split("/");
  let currentPage = pathParts[pathParts.length - 1] || "dashboard.html";
  if (currentPage === "") currentPage = "index.html";

  // Build the layout wrapper if present
  const wrapper = document.getElementById("layout-wrapper");
  const mainContent = document.getElementById("main-content");

  if (wrapper && mainContent && !isLoginPage) {
    // Add fade-in animation to main
    mainContent.classList.add("animate-fade-in");
    
    // Helper for active navigation items under High Density theme
    const getNavItemClass = (page) => {
      const isActive = currentPage === page;
      return `nav-item flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ` + 
             (isActive ? "bg-[#2563EB]/10 text-[#2563EB]" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100");
    };

    // Create the Layout Structure
    const layoutHTML = `
      <!-- Sidebar Drawer Backing (Mobile Only) -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-slate-950/60 z-40 hidden md:hidden backdrop-blur-sm"></div>

      <!-- Left Sidebar Panel -->
      <aside id="sidebar-panel" class="fixed inset-y-0 left-0 w-56 bg-[#1E293B] border-r border-slate-700/50 flex flex-col z-50 transform -translate-x-full md:translate-x-0 md:static md:h-screen transition-transform duration-300 ease-in-out">
        <!-- Logo Header -->
        <div class="h-14 flex items-center px-5 border-b border-slate-700/50 gap-2.5">
          <div class="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/10">
            <i data-lucide="route" class="w-4 h-4 text-white"></i>
          </div>
          <div>
            <span class="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">TransitOps</span>
            <span class="text-[9px] font-bold text-cyan-400 ml-1 uppercase px-1 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/50">AI</span>
          </div>
        </div>

        <!-- Scrollable Navigation Links -->
        <nav class="flex-1 overflow-y-auto px-2.5 py-3.5 space-y-0.5">
          <div class="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Operations Core</div>
          
          <a href="dashboard.html" class="${getNavItemClass('dashboard.html')}" id="nav-dashboard">
            <i data-lucide="layout-dashboard" class="w-3.5 h-3.5"></i>
            <span>Dashboard</span>
          </a>

          <a href="fleet.html" class="${getNavItemClass('fleet.html')}" id="nav-fleet">
            <i data-lucide="map" class="w-3.5 h-3.5"></i>
            <span>Live Monitoring</span>
          </a>

          <a href="vehicles.html" class="${getNavItemClass('vehicles.html')}" id="nav-vehicles">
            <i data-lucide="truck" class="w-3.5 h-3.5"></i>
            <span>Vehicle Registry</span>
          </a>

          <a href="drivers.html" class="${getNavItemClass('drivers.html')}" id="nav-drivers">
            <i data-lucide="users" class="w-3.5 h-3.5"></i>
            <span>Driver Registry</span>
          </a>

          <a href="trips.html" class="${getNavItemClass('trips.html')}" id="nav-trips">
            <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
            <span>Trip Planner</span>
          </a>

          <div class="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold pt-3 mb-1">Logistics & Fleet Care</div>

          <a href="maintenance.html" class="${getNavItemClass('maintenance.html')}" id="nav-maintenance">
            <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
            <span>Maintenance</span>
          </a>

          <a href="fuel.html" class="${getNavItemClass('fuel.html')}" id="nav-fuel">
            <i data-lucide="droplet" class="w-3.5 h-3.5"></i>
            <span>Fuel Management</span>
          </a>

          <a href="expenses.html" class="${getNavItemClass('expenses.html')}" id="nav-expenses">
            <i data-lucide="credit-card" class="w-3.5 h-3.5"></i>
            <span>Expense Tracker</span>
          </a>

          <div class="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold pt-3 mb-1">Intelligence & Documents</div>

          <a href="assistant.html" class="${getNavItemClass('assistant.html')}" id="nav-assistant">
            <i data-lucide="bot-message-square" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span class="font-medium text-cyan-400">AI Co-Pilot</span>
          </a>

          <a href="analytics.html" class="${getNavItemClass('analytics.html')}" id="nav-analytics">
            <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i>
            <span>Deep Analytics</span>
          </a>

          <a href="documents.html" class="${getNavItemClass('documents.html')}" id="nav-documents">
            <i data-lucide="files" class="w-3.5 h-3.5"></i>
            <span>Documents Vault</span>
          </a>

          <div class="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-semibold pt-3 mb-1">Settings & Logs</div>

          <a href="settings.html" class="${getNavItemClass('settings.html')}" id="nav-settings">
            <i data-lucide="settings" class="w-3.5 h-3.5"></i>
            <span>System Settings</span>
          </a>
        </nav>

        <!-- Driver / Admin Footer Profile -->
        <div class="p-3 border-t border-slate-700/50 bg-[#151D2E]">
          <a href="profile.html" class="flex items-center gap-2.5 hover:bg-slate-800/60 p-1.5 rounded transition-colors duration-200">
            <div id="admin-avatar" class="w-8 h-8 rounded-full bg-blue-600 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 select-none">OA</div>
            <div class="overflow-hidden">
              <div class="text-xs font-semibold truncate text-slate-200" id="admin-name">Ops Admin</div>
              <div class="text-[10px] text-slate-500 truncate" id="admin-role">Operations Director</div>
            </div>
          </a>
        </div>
      </aside>

      <!-- Main Layout Body Section -->
      <div class="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <!-- Top Navigation Bar -->
        <header class="h-14 bg-[#1E293B] border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div class="flex items-center gap-4">
            <!-- Mobile Toggle -->
            <button id="mobile-sidebar-toggle" class="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white md:hidden">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>

            <!-- Breadcrumbs -->
            <div class="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span class="hover:text-slate-300 cursor-pointer">TransitOps</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
              <span class="text-slate-200 font-medium capitalize" id="breadcrumb-page-name">${currentPage.replace(".html", "").replace("-", " ")}</span>
            </div>
          </div>

          <!-- Utility Control Elements -->
          <div class="flex items-center gap-3 md:gap-5">
            <!-- System Clock -->
            <div class="hidden lg:flex flex-col text-right">
              <span id="utc-clock" class="text-xs font-mono text-cyan-400 font-bold">--:--:-- IST</span>
              <span class="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Live Operations (IST)</span>
            </div>

            <!-- Light/Dark Theme Toggle -->
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Toggle Light/Dark Theme">
              <i id="theme-toggle-icon" data-lucide="sun" class="w-5 h-5"></i>
            </button>

            <!-- Quick Action Trigger -->
            <div class="relative">
              <button id="quick-action-btn" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all duration-150">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Quick Dispatch</span>
              </button>
              <!-- Quick Action Dropdown -->
              <div id="quick-action-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                <a href="trips.html?action=new" class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <i data-lucide="navigation" class="w-4 h-4 text-cyan-400"></i> Dispatch Vehicle
                </a>
                <a href="maintenance.html?action=new" class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <i data-lucide="wrench" class="w-4 h-4 text-amber-400"></i> Add Maintenance
                </a>
                <a href="fuel.html?action=new" class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <i data-lucide="droplet" class="w-4 h-4 text-emerald-400"></i> Register Fuel Log
                </a>
              </div>
            </div>

            <!-- Notification Center -->
            <div class="relative">
              <button id="notification-bell" class="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white relative">
                <i data-lucide="bell" class="w-5 h-5"></i>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              
              <!-- Dropdown Panel -->
              <div id="notifications-panel" class="hidden absolute right-0 mt-2 w-80 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-200">Alert Center</span>
                  <a href="notifications.html" class="text-xs text-blue-400 hover:underline">View All</a>
                </div>
                <div class="max-h-72 overflow-y-auto divide-y divide-slate-800" id="notification-rows">
                  <div class="p-3.5 hover:bg-slate-800/50 flex gap-2.5 transition-colors">
                    <span class="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                    <div>
                      <h4 class="text-xs font-semibold text-rose-400">Predictive Maintenance Flag</h4>
                      <p class="text-[11px] text-slate-400 mt-0.5">Truck-12 shows excessive impeller vibrations.</p>
                      <span class="text-[10px] text-slate-500 mt-1 block">5m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile dropdown -->
            <div class="relative">
              <button id="navbar-profile" class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <div id="navbar-profile-avatar" class="w-8 h-8 rounded-full bg-blue-600 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 select-none">OA</div>
                <i data-lucide="chevron-down" class="w-4 h-4 hidden sm:block"></i>
              </button>
              <!-- Dropdown Menu -->
              <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                <a href="profile.html" class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <i data-lucide="user" class="w-4 h-4"></i> My Profile
                </a>
                <a href="settings.html" class="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors">
                  <i data-lucide="settings" class="w-4 h-4"></i> System Settings
                </a>
                <hr class="border-slate-800 my-1">
                <button id="logout-button" class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-rose-950/40 text-rose-400 rounded-lg transition-colors text-left">
                  <i data-lucide="log-out" class="w-4 h-4"></i> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Workspace container inject -->
        <div id="workspace-container" class="flex-1 overflow-y-auto"></div>
      </div>
    `;

    // Empty the wrapper first
    wrapper.innerHTML = "";
    
    // Create new structure
    const layoutWrapperDiv = document.createElement("div");
    layoutWrapperDiv.className = "flex w-full min-h-screen bg-[#0F172A] text-slate-100";
    layoutWrapperDiv.innerHTML = layoutHTML;
    
    wrapper.appendChild(layoutWrapperDiv);

    // Re-mount the custom page main-content inside the workspace-container
    const workspaceContainer = document.getElementById("workspace-container");
    if (workspaceContainer) {
      workspaceContainer.appendChild(mainContent);
    }

    // Init custom page features
    initLayoutControls();
    initNotificationsFeed();
    loadProfileDetails();
    
    // Redraw Lucide Icons
    lucide.createIcons();
  }
});

// Setup sidebar toggles and clock controls
function initLayoutControls() {
  const toggleBtn = document.getElementById("mobile-sidebar-toggle");
  const sidebar = document.getElementById("sidebar-panel");
  const overlay = document.getElementById("sidebar-overlay");

  if (toggleBtn && sidebar && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle("-translate-x-full");
      overlay.classList.toggle("hidden");
    };
    toggleBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);
  }

  // Quick action menu trigger
  const quickActionBtn = document.getElementById("quick-action-btn");
  const quickActionDropdown = document.getElementById("quick-action-dropdown");
  if (quickActionBtn && quickActionDropdown) {
    quickActionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      quickActionDropdown.classList.toggle("hidden");
    });
  }

  // Notification panel trigger
  const notifBell = document.getElementById("notification-bell");
  const notifPanel = document.getElementById("notifications-panel");
  if (notifBell && notifPanel) {
    notifBell.addEventListener("click", (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle("hidden");
    });
  }

  // Profile Dropdown Trigger
  const profileBtn = document.getElementById("navbar-profile");
  const profileDropdown = document.getElementById("profile-dropdown");
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });
  }

  // Global window click to dismiss all active dropdowns
  window.addEventListener("click", () => {
    quickActionDropdown?.classList.add("hidden");
    notifPanel?.classList.add("hidden");
    profileDropdown?.classList.add("hidden");
  });

  // Logout control
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // Handle Theme Toggle (Light/Dark Mode)
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");
  
  const applyTheme = (theme) => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      document.documentElement.classList.add("light-theme");
      if (themeToggleIcon) {
        themeToggleIcon.setAttribute("data-lucide", "moon");
      }
    } else {
      document.body.classList.remove("light-theme");
      document.documentElement.classList.remove("light-theme");
      if (themeToggleIcon) {
        themeToggleIcon.setAttribute("data-lucide", "sun");
      }
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const currentTheme = localStorage.getItem("theme") || "dark";
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const activeTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
      localStorage.setItem("theme", activeTheme);
      applyTheme(activeTheme);
      window.showToast?.(`Switched to ${activeTheme} mode`, "info");
    });
  }

  // Live India Time (IST) Clock sync
  const clockEl = document.getElementById("utc-clock");
  if (clockEl) {
    const updateTime = () => {
      const d = new Date();
      try {
        const options = {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        };
        const formatter = new Intl.DateTimeFormat("en-GB", options);
        clockEl.innerText = `${formatter.format(d)} IST`;
      } catch (err) {
        const utcStr = d.toUTCString().split(" ")[4];
        clockEl.innerText = `${utcStr} IST`;
      }
    };
    setInterval(updateTime, 1000);
    updateTime();
  }

  // Create floating AI Co-pilot launcher button (unless we are on assistant.html)
  if (!window.location.pathname.endsWith("assistant.html")) {
    const aiBubble = document.createElement("div");
    aiBubble.className = "fixed bottom-6 right-6 z-40 animate-bounce";
    aiBubble.innerHTML = `
      <a href="assistant.html" class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full font-bold shadow-2xl shadow-cyan-500/30 hover:scale-105 transform transition duration-150 border border-cyan-400/30">
        <i data-lucide="bot" class="w-5 h-5"></i>
        <span class="text-xs tracking-tight">Ask Co-Pilot</span>
      </a>
    `;
    document.body.appendChild(aiBubble);
  }
}

// Dynamically fetch and display system alerts from backend
async function initNotificationsFeed() {
  const container = document.getElementById("notification-rows");
  if (!container) return;

  try {
    const alerts = await window.apiFetch("/api/notifications");
    container.innerHTML = "";
    
    if (alerts && alerts.length > 0) {
      alerts.forEach(alert => {
        const row = document.createElement("div");
        row.className = "p-3.5 hover:bg-slate-800/50 flex gap-2.5 transition-all duration-150 cursor-pointer";
        
        let colorClass = "bg-blue-500";
        if (alert.type === "critical") colorClass = "bg-rose-500";
        if (alert.type === "warning") colorClass = "bg-amber-500";

        row.innerHTML = `
          <span class="w-2 h-2 rounded-full ${colorClass} mt-1.5 flex-shrink-0"></span>
          <div>
            <h4 class="text-xs font-semibold text-slate-200">${alert.title}</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">${alert.text}</p>
            <span class="text-[10px] text-slate-500 mt-1 block">${alert.time}</span>
          </div>
        `;
        container.appendChild(row);
      });
    } else {
      container.innerHTML = `<div class="p-4 text-xs text-slate-500 text-center">No alerts logged today.</div>`;
    }
  } catch (err) {
    console.error("Alerts init failed:", err);
  }
}

// Render persistent user credentials
function loadProfileDetails() {
  const profileRaw = localStorage.getItem("transit_user_profile");
  if (profileRaw) {
    try {
      const user = JSON.parse(profileRaw);
      const nameEl = document.getElementById("admin-name");
      const roleEl = document.getElementById("admin-role");
      const avatarEl = document.getElementById("admin-avatar");

      if (nameEl) nameEl.innerText = user.name || "Ops Admin";
      if (roleEl) roleEl.innerText = user.role || "Operations Director";
      if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    } catch (e) {
      console.error("Profile payload parse failed", e);
    }
  }
}

// Enterprise dynamic Toast system
window.showToast = function(message, type = "success") {
  // Create container if not exists
  let container = document.getElementById("toast-holder");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-holder";
    container.className = "fixed top-6 right-6 space-y-3 z-50 max-w-sm pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto border transform translate-x-12 opacity-0 transition-all duration-300 animate-fade-in`;
  
  let bgClass = "bg-slate-900 border-slate-700 text-slate-200";
  let iconName = "check-circle";
  let iconColor = "text-emerald-500";

  if (type === "success") {
    bgClass = "bg-[#1E293B] border-emerald-500/20 text-slate-200";
    iconColor = "text-emerald-500";
  } else if (type === "warning") {
    bgClass = "bg-[#1E293B] border-amber-500/20 text-slate-200";
    iconName = "alert-triangle";
    iconColor = "text-amber-500";
  } else if (type === "danger") {
    bgClass = "bg-[#1E293B] border-rose-500/20 text-slate-200";
    iconName = "x-circle";
    iconColor = "text-rose-500";
  } else if (type === "info") {
    bgClass = "bg-[#1E293B] border-blue-500/20 text-slate-200";
    iconName = "info";
    iconColor = "text-blue-400";
  }

  toast.innerHTML = `
    <div class="${iconColor} mt-0.5"><i data-lucide="${iconName}" class="w-5 h-5"></i></div>
    <div class="flex-1 text-xs">
      <p class="font-medium">${message}</p>
    </div>
    <button class="text-slate-500 hover:text-slate-300 text-xs transition-colors" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Trigger entering animation
  setTimeout(() => {
    toast.classList.remove("translate-x-12", "opacity-0");
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => { toast.remove(); }, 300);
  }, 5000);
};
