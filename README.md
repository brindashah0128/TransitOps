# TransitOps AI: Enterprise Fleet Operations Dashboard (India Edition)

TransitOps AI is an enterprise-grade transit dispatcher, transport optimizer, and predictive maintenance platform fully localized for India. It operates as a high-fidelity full-stack application leveraging a custom Node.js/Express backend integrated with modern REST APIs and a responsive, glassmorphic frontend utilizing OpenStreetMap/Leaflet maps, dynamic charting, and a twin-state Dark/Light theme engine.

---
## 🌐 Live Demo

**Application URL:**  
https://transitops-ai-il5f.onrender.com


## 🛠️ Backend Architecture (Built & Ready)

Unlike static-only mock apps, TransitOps AI runs a robust **Node.js + Express** server in `/server.ts` which provides:
* **In-Memory Stateful Databases**: Live arrays for vehicles, drivers, trips, maintenance logs, fuel tickets, and expense ledger items that support complete **CRUD (Create, Read, Update, Delete)** operations. Updates made on any frontend screen persist across navigate page swaps during the session.
* **Gemini 3.5 AI Assistant Integration**: A server-side conversational endpoint at `/api/assistant` utilizing the official `@google/genai` SDK. It securely proxies queries to the Gemini API, maintaining API key confidentiality from the browser while feeding the model real-time fleet KPIs, vehicle IDs, driver ratings, and route parameters.
* **Production Asset Bundle**: An optimized production-build script compiles `/server.ts` using `esbuild` into a single, self-contained `dist/server.cjs` bundle, fully compatible with Docker, Cloud Run, or any production Node environments.

---

## 🇮🇳 India-Specific Localization & Metric Systems

Every asset, ledger sheet, and calculation has been fully localized to conform to Indian logistics metrics and route planning structures:
* **Currency**: Replaced all USD ($) symbols with **INR (₹)** across all statistics, modal planners, logs, and database entries.
* **Distance & Speed**: Configured to use metric system benchmarks—**Kilometers (km)** for distance metrics and **km/h** for telemetry speeds instead of miles/MPH.
* **Fuel & Energy Volume**: Standardized to **Liters (L)** for diesel/biodiesel vehicles and **kWh** for EV trucks (e.g. Tesla Semi equivalent models).
* **Time**: Features a Live System Operations Clock synced precisely to **Indian Standard Time (IST)** with `Asia/Kolkata` hour formatting.
* **Indian Corridor Route Matrix**: Pre-configured Dijkstra shortest-path route coordinates mapping real transit routes:
  * **Mumbai Freight Terminal ↔ Pune Logistics Hub** (150 km)
  * **Mumbai Freight Terminal ↔ Jaipur Cargo Hub** (1,150 km)
  * **Mumbai Freight Terminal ↔ Chennai Port Hub** (1,340 km)
  * **Delhi Okhla Terminal ↔ Pune Logistics Hub** (1,430 km)
  * **Delhi Okhla Terminal ↔ Jaipur Cargo Hub** (270 km)
  * **Delhi Okhla Terminal ↔ Chennai Port Hub** (2,200 km)
  * **Bengaluru Depot ↔ Pune Logistics Hub** (840 km)
  * **Bengaluru Depot ↔ Jaipur Cargo Hub** (2,000 km)
  * **Bengaluru Depot ↔ Chennai Port Hub** (350 km)

---

## 📂 Structural Directory Map

```bash
├── server.ts                 # Main full-stack Express server containing REST APIs & Gemini models
├── package.json              # Global dependency managers & build instructions
├── .env           # Secret key template (e.g., GEMINI_API_KEY)
└── frontend/                 # Complete frontend directory served statically by Express
    ├── index.html            # Main operator secure entry login portal
    ├── dashboard.html        # Main overview: high-priority metrics (₹), dynamic maps, live suggestions
    ├── fleet.html            # Interactive Live GPS telemetry mapping tracking Indian corridors
    ├── trips.html            # Real-time pathfinder dispatcher utilizing Dijkstra map visual paths
    ├── vehicles.html         # Roster index for heavy trucks, EVs, and cargo vans with upload permits
    ├── drivers.html          # CDL pilot database with safety charts and performance metrics
    ├── maintenance.html      # Fleet breakdown ledger, schedule tasks, and budget (₹) trackers
    ├── fuel.html             # Fuel efficiency (km/L) graphs and refueling logs
    ├── expenses.html         # Live financial balance sheet ledger transactions (₹)
    ├── documents.html        # Regulatory compliance upload portal (PCC, Permit, fitness certs)
    ├── notifications.html    # Consolidated real-time AI warnings and exception alerts
    ├── profile.html          # Operator console access tokens & administrative terminals
    ├── settings.html         # Advanced pathfinding settings & system toggle mechanisms
    ├── assistant.html        # Full-screen conversational workspace with the AI Co-Pilot
    │
    ├── components/
    │   └── layout.js         # Shared UI shell injecting dynamic Sidebars, headers, IST clock, & theme toggles
    │
    ├── css/
    │   └── style.css         # Glassmorphism dark layout & full light mode variables override styles
    │
    └── js/                   # Operational logic scripts corresponding to each portal page
        ├── dashboard.js      # Coordinates live Leaflet map rendering & data updates
        ├── trips.js          # Computes shortest-path routes & plots real geographical paths
        ├── assistant.js      # Chat pipeline with streaming message typing simulations
        └── [page_name].js    # Specific CRUD controllers interacting with /api/* routes
```

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** installed on your host machine.

### 2. Initialization & Packages
```bash
# Install core server dependencies (Express, @google/genai, tsx, esbuild)
npm install
```

### 3. Setting Up API Keys & Variables
```bash
cp .env
```
Inside `.env`, populate your Gemini API Key to enable the live smart co-pilot:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(If left empty or unconfigured, the AI co-pilot gracefully executes in high-fidelity offline simulation mode).*

### 4. Running the Development Server
Kick off the live-reloading full-stack server with:
```bash
npm run dev
```
The server will boot instantly on **`http://localhost:3000`**. You can open this address in any browser.

### 5. Compiling for Production
To bundle the backend for cloud container deployment:
```bash
npm run build
```
This generates:
1. `dist/server.cjs` - A bundled, super-efficient Node production script.
2. `dist/index.html` and other assets inside `/dist` if building separate assets.

To test the compiled production build locally:
```bash
npm start
```

---

## 🎨 Dual Theme Engine

The dashboard features a **dynamic, custom-coded theme toggler** located in the top-right header:
* **Dark Mode (Default)**: Employs a stunning, low-contrast, navy-and-slate layout featuring vibrant cybernetic gradients (Cyan/Purple/Emerald) designed to minimize eye strain during nocturnal logistics dispatches.
* **Light Mode**: Re-renders borders, tables, inputs, sidebars, and Leaflet map tile-overlays into crisp, paper-white and slate-gray styles optimized for daytime operators.
* **Zero Flickering**: The user's theme selection is stored in `localStorage` and executed instantaneously via an inline block inside `layout.js` before DOM paint, eliminating flashing anomalies.
