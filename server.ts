import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Global mock databases to support full CRUD operations in UI
const MOCK_VEHICLES = [
  { id: "v-01", name: "Volvo FH16 (Truck-12)", type: "Heavy Truck", reg: "MH-12-PQ-9988", fuel: "Diesel", capacity: "25 Tons", driver: "Rajesh Kumar", trip: "Mumbai to Pune Corridor", status: "On Trip", health: 92, insurance: "Active", regStatus: "Active", lat: 19.0760, lng: 72.8777, speed: 65, eta: "14:30", fuelEfficiency: "7.2 km/L", docs: ["Registration", "Insurance", "DOT Cert"] },
  { id: "v-02", name: "Tesla Semi (Truck-05)", type: "EV Heavy Truck", reg: "DL-3C-EA-4422", fuel: "Electric", capacity: "20 Tons", driver: "Amit Patel", trip: "Delhi to Jaipur Corridor", status: "On Trip", health: 98, insurance: "Active", regStatus: "Active", lat: 28.6139, lng: 77.2090, speed: 70, eta: "16:15", fuelEfficiency: "1.1 kWh/km", docs: ["Registration", "Insurance"] },
  { id: "v-03", name: "Ford E-Transit (Van-08)", type: "EV Cargo Van", reg: "KA-03-MB-5511", fuel: "Electric", capacity: "3.5 Tons", driver: "None", trip: "None", status: "Available", health: 87, insurance: "Active", regStatus: "Active", lat: 12.9716, lng: 77.5946, speed: 0, eta: "N/A", fuelEfficiency: "0.4 kWh/km", docs: ["Registration", "Insurance", "City Permit"] },
  { id: "v-04", name: "Freightliner Cascadia", type: "Heavy Truck", reg: "TN-07-CK-8877", fuel: "Diesel", capacity: "24 Tons", driver: "None", trip: "None", status: "Maintenance", health: 64, insurance: "Active", regStatus: "Active", lat: 13.0827, lng: 80.2707, speed: 0, eta: "N/A", fuelEfficiency: "6.8 km/L", docs: ["Registration", "Insurance"] },
  { id: "v-05", name: "Kenworth T680", type: "Heavy Truck", reg: "WB-02-JH-1133", fuel: "Diesel", capacity: "25 Tons", driver: "None", trip: "Kolkata to Haldia Port", status: "On Trip", health: 91, insurance: "Active", regStatus: "Active", lat: 22.5726, lng: 88.3639, speed: 62, eta: "18:45", fuelEfficiency: "7.0 km/L", docs: ["Registration", "Insurance", "DOT Cert"] },
  { id: "v-06", name: "Peterbilt 579", type: "Heavy Truck", reg: "TS-09-EV-2244", fuel: "Diesel", capacity: "24 Tons", driver: "None", trip: "Hyderabad Cargo Loop", status: "Emergency", health: 45, insurance: "Active", regStatus: "Expired Soon", lat: 17.3850, lng: 78.4867, speed: 5, eta: "Emergency Stop", fuelEfficiency: "6.5 km/L", docs: ["Registration", "Insurance"] }
];

const MOCK_DRIVERS = [
  { id: "d-01", name: "Rajesh Kumar", status: "On Trip", rating: 4.8, safetyScore: 94, license: "Active", activeTrip: "Mumbai to Pune Corridor", availability: "Unavailable", phone: "+91 98765 43210", experience: "8 Years", lastIncident: "None", avatar: "", performance: [85, 90, 88, 92, 94] },
  { id: "d-02", name: "Amit Patel", status: "Available", rating: 4.9, safetyScore: 98, license: "Active", activeTrip: "None", availability: "Available", phone: "+91 98765 12345", experience: "12 Years", lastIncident: "None", avatar: "", performance: [95, 97, 98, 97, 98] }
];

const MOCK_TRIPS = [
  { id: "t-101", vehicle: "Volvo FH16 (Truck-12)", driver: "Rajesh Kumar", source: "Mumbai JNPT Port", destination: "Pune Logistics Hub", status: "In Progress", distance: "150 km", cargoWeight: "18 Tons", fuelEst: "20 Liters", costEst: "₹2,200", eta: "14:30", timeline: [{ event: "Dispatched", time: "08:00 AM" }, { event: "Expressway Toll Crossed", time: "10:15 AM" }, { event: "Currently Driving", time: "Active" }] },
  { id: "t-102", vehicle: "Tesla Semi (Truck-05)", driver: "Amit Patel", source: "Delhi Okhla Terminal", destination: "Jaipur Cargo Hub", status: "In Progress", distance: "260 km", cargoWeight: "15 Tons", fuelEst: "280 kWh", costEst: "₹800", eta: "16:15", timeline: [{ event: "Dispatched", time: "11:00 AM" }, { event: "Gurugram Border Crossed", time: "01:45 PM" }] }
];

const MOCK_MAINTENANCE = [
  { id: "m-01", vehicle: "Volvo FH16 (Truck-12)", type: "Engine Service", date: "2026-07-15", status: "Upcoming", cost: 35000, notes: "Regular oil filter replacement and tuning." },
  { id: "m-02", vehicle: "Tesla Semi (Truck-05)", type: "Battery Diagnostics", date: "2026-07-12", status: "In Progress", cost: 15000, notes: "Diagnostic scanning of cell clusters." },
  { id: "m-03", vehicle: "Freightliner Cascadia", type: "Brake Overhaul", date: "2026-07-08", status: "Completed", cost: 95000, notes: "Complete replacement of heavy drum brakes." },
  { id: "m-04", vehicle: "Ford E-Transit (Van-08)", type: "Tire Rotation & Alignment", date: "2026-07-02", status: "Completed", cost: 12000, notes: "Rotated tires, adjusted steering column." }
];

const MOCK_FUEL_LOGS = [
  { id: "f-01", vehicle: "Volvo FH16 (Truck-12)", date: "2026-07-10", volume: "170 Liters", cost: 16500, odometer: "125,400 km", fuelEfficiency: "7.2 km/L" },
  { id: "f-02", vehicle: "Kenworth T680", date: "2026-07-09", volume: "190 Liters", cost: 18500, odometer: "84,200 km", fuelEfficiency: "7.0 km/L" },
  { id: "f-03", vehicle: "Peterbilt 579", date: "2026-07-08", volume: "160 Liters", cost: 15500, odometer: "142,100 km", fuelEfficiency: "6.5 km/L" }
];

const MOCK_EXPENSES = [
  { id: "e-01", desc: "Premium Diesel - Volvo FH16", category: "Fuel", cost: 125400, date: "2026-07-10" },
  { id: "e-02", desc: "CDL Pilot Salaries - June", category: "Salaries", cost: 380000, date: "2026-07-01" },
  { id: "e-03", desc: "Brake Overhaul - Cascadia", category: "Maintenance", cost: 95000, date: "2026-07-08" },
  { id: "e-04", desc: "National NH48 Expressway Tolls", category: "Tolls", cost: 19500, date: "2026-07-09" },
  { id: "e-05", desc: "Battery Diagnostic Scan - Tesla Semi", category: "Maintenance", cost: 15000, date: "2026-07-11" },
  { id: "e-06", desc: "EV Supercharger Grid - Tesla Semi", category: "Fuel", cost: 8400, date: "2026-07-11" }
];

const MOCK_NOTIFICATIONS = [
  { id: "n-01", category: "AI Alerts", title: "Predictive Maintenance Alert", text: "Volvo FH16 (Truck-12) shows high exhaust vibration. AI predicts water pump failure within 48h.", time: "10 mins ago", type: "critical" },
  { id: "n-02", category: "Trips", title: "Trip Delayed", text: "Truck-05 (Tesla Semi) delayed on Expressway due to high weather temperatures.", time: "1 hr ago", type: "warning" },
  { id: "n-03", category: "Documents", title: "Driver License Expiring", text: "Amit Patel's license expires in 12 days. Renew immediately.", time: "2 hrs ago", type: "warning" },
  { id: "n-04", category: "Fuel", title: "Abnormal Fuel Theft Flagged", text: "Truck-12 fuel volume drop of 45 Liters detected in idle state.", time: "5 hrs ago", type: "critical" }
];

// AUTHENTICATION ENDPOINT
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required." });
  }
  // Simulate JWT token
  res.json({
    token: "transitops-ai-secure-jwt-token-hackathon",
    user: {
      name: "Fleet Ops Admin",
      username: username,
      role: role || "Operations Director",
      avatar: ""
    }
  });
});

// VEHICLES ENDPOINTS
app.get("/api/vehicles", (req, res) => {
  res.json(MOCK_VEHICLES);
});

app.post("/api/vehicles", (req, res) => {
  const newVehicle = {
    id: `v-0${MOCK_VEHICLES.length + 1}`,
    name: req.body.name || "Generic Heavy Truck",
    type: req.body.type || "Heavy Truck",
    reg: req.body.reg || "TX-0000-NEW",
    fuel: req.body.fuel || "Diesel",
    capacity: req.body.capacity || "24 Tons",
    driver: req.body.driver || "None",
    trip: "None",
    status: "Available",
    health: 100,
    insurance: "Active",
    regStatus: "Active",
    lat: 32.7767,
    lng: -96.7970,
    speed: 0,
    eta: "N/A",
    fuelEfficiency: "7.0 km/L",
    docs: ["Registration", "Insurance"]
  };
  MOCK_VEHICLES.push(newVehicle);
  res.status(201).json(newVehicle);
});

// DRIVERS ENDPOINTS
app.get("/api/drivers", (req, res) => {
  res.json(MOCK_DRIVERS);
});

// TRIPS ENDPOINTS
app.get("/api/trips", (req, res) => {
  res.json(MOCK_TRIPS);
});

app.post("/api/trips", (req, res) => {
  const newTrip = {
    id: `t-${MOCK_TRIPS.length + 101}`,
    vehicle: req.body.vehicle || "Volvo FH16 (Truck-12)",
    driver: req.body.driver || "Rajesh Kumar",
    source: req.body.source || "Mumbai Freight Terminal",
    destination: req.body.destination || "Pune Logistics Hub",
    status: "Scheduled",
    distance: req.body.distance || "150 km",
    cargoWeight: req.body.cargoWeight || "15 Tons",
    fuelEst: req.body.fuelEst || "20 Liters",
    costEst: req.body.costEst || "₹2,200",
    eta: req.body.eta || "N/A",
    timeline: [{ event: "Trip Created", time: "Now" }]
  };
  MOCK_TRIPS.push(newTrip);
  res.status(201).json(newTrip);
});

// MAINTENANCE ENDPOINTS
app.get("/api/maintenance", (req, res) => {
  res.json(MOCK_MAINTENANCE);
});

app.post("/api/maintenance", (req, res) => {
  const record = {
    id: `m-0${MOCK_MAINTENANCE.length + 1}`,
    vehicle: req.body.vehicle,
    type: req.body.type,
    date: req.body.date,
    status: "Upcoming",
    cost: Number(req.body.cost) || 300,
    notes: req.body.notes || ""
  };
  MOCK_MAINTENANCE.push(record);
  res.status(201).json(record);
});

// FUEL LOGS ENDPOINTS
app.get("/api/fuel", (req, res) => {
  res.json(MOCK_FUEL_LOGS);
});

app.post("/api/fuel", (req, res) => {
  const log = {
    id: `f-0${MOCK_FUEL_LOGS.length + 1}`,
    vehicle: req.body.vehicle,
    date: req.body.date,
    volume: req.body.volume + " Liters",
    cost: Number(req.body.cost),
    odometer: req.body.odometer + " km",
    fuelEfficiency: "7.0 km/L"
  };
  MOCK_FUEL_LOGS.push(log);
  res.status(201).json(log);
});

// EXPENSES ENDPOINTS
app.get("/api/expenses", (req, res) => {
  res.json(MOCK_EXPENSES);
});

app.post("/api/expenses", (req, res) => {
  const expense = {
    id: `e-0${MOCK_EXPENSES.length + 1}`,
    desc: req.body.desc || "Operational Overhead",
    category: req.body.category || "Other",
    cost: Number(req.body.cost) || 0,
    date: req.body.date || new Date().toISOString().split("T")[0]
  };
  MOCK_EXPENSES.push(expense);
  res.status(201).json(expense);
});

// NOTIFICATIONS ENDPOINTS
app.get("/api/notifications", (req, res) => {
  res.json(MOCK_NOTIFICATIONS);
});

// ANALYTICS ENDPOINTS
app.get("/api/analytics", (req, res) => {
  res.json({
    fleetHealthScore: 88,
    todayTrips: MOCK_TRIPS.length,
    revenue: 125400,
    expenses: 84650,
    fuelConsumption: "13,050 Liters",
    operationalCost: "₹65/km",
    utilizationRate: [
      { day: "Mon", rate: 75 },
      { day: "Tue", rate: 82 },
      { day: "Wed", rate: 88 },
      { day: "Thu", rate: 84 },
      { day: "Fri", rate: 91 },
      { day: "Sat", rate: 65 },
      { day: "Sun", rate: 58 }
    ],
    expensesByCategory: MOCK_EXPENSES,
    routeDensity: [
      { route: "NH-48 Mumbai to Pune", density: 95 },
      { route: "NH-48 Delhi to Jaipur", density: 85 },
      { route: "NH-4 Bengaluru to Chennai", density: 70 }
    ]
  });
});

// AI ASSISTANT CONVERSATION PROXY WITH REAL GEMINI INTEGRATION
app.post("/api/ai", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message prompt provided." });
  }

  const ai = getGemini();

  if (!ai) {
    // If Gemini API Key is not configured or missing, return a smart, highly realistic, offline transport-aware AI agent response
    const lowercase = message.toLowerCase();
    let reply = "";
    if (lowercase.includes("maintenance") || lowercase.includes("truck-12")) {
      reply = "### AI Operations & Predictive Maintenance Insight\n\nBased on localized fleet diagnostics:\n* **Volvo FH16 (Truck-12)** has been flagged with an increasing vibration metric of **8.4 Hz** on the primary coolant impeller pump. \n* **Recommendation**: AI suggests scheduling emergency inspection within **48 hours** before cavitation damage triggers a full engine coolant system lock, preventing a **₹35,000 repair cost** and **12 hours of route delay**.";
    } else if (lowercase.includes("fuel") || lowercase.includes("efficiency")) {
      reply = "### AI Fuel Optimization Model\n\nComparing active fleet modules:\n1. **Truck-05 (Tesla Semi Equivalent)** is leading the operational margin profile with **1.1 kWh/km** (equivalent to an off-peak rate of **₹15/km**).\n2. **Truck-12 (Volvo FH16)** average: **7.2 km/L** (₹42/km).\n\n**Actionable Suggestion**: Dispatch the **Tesla Semi Equivalent** on the high-mileage *Mumbai to Pune* standard routes, while allocating the bio-diesel **Kenworth T680** for secondary port routing to maximize emission credit subsidies.";
    } else if (lowercase.includes("dispatch") || lowercase.includes("recommend")) {
      reply = "### Smart Dispatch Recommendation\n\nFor a standard transit route from **Mumbai to Pune**:\n* **Recommended Vehicle**: `v-03` (**Ford E-Transit Van-08**) currently sitting at a stable **87% State-of-Charge** and situated near Mumbai depot limits. If in MH bounds, choose `v-05` (**Kenworth T680**).\n* **Recommended Driver**: **Rajesh Kumar** due to an outstanding driving safety rating of **94%** and zero driving hours violations this cycle.";
    } else {
      reply = `### TransitOps AI Co-Pilot\n\nHello! I am your real-time Fleet Operations Assistant. Currently, my API key is configured offline, but here is a quick operations summary:\n\n* **Fleet Health**: Currently rated at **88/100** (Good).\n* **Active Exceptions**: 1 Critical Alert (Volvo Impeller Vibration) & 1 Pending Registration Expiry.\n* **Optimized Routes**: Dijkstra routing has calculated shortest paths for 3 active dispatches.\n\nAsk me about predictive maintenance forecasting, route ETAs, fuel calculations, or driver safety rankings!`;
    }
    return res.json({ text: reply });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Inject system instruction containing full context of the hackathon database
    const systemPrompt = `You are "TransitOps AI", an enterprise-grade transit dispatcher, transport optimizer, and predictive maintenance co-pilot.
Use structured, elegant Markdown formatting with bold lists, metrics, tables, and crystal-clear headers. Speak like an expert.

Here is the real-time operational context of the fleet database:
1. VEHICLES:
   - v-01: Volvo FH16 (Truck-12), Diesel. Health 92%. Active on Mumbai to Pune with Rajesh Kumar. Status: On Trip. High Impeller vibrations detected!
   - v-02: Tesla Semi (Truck-05), EV. Health 98%. Active on Delhi to Jaipur with Amit Patel. Status: On Trip. Excellent efficiency.
   - v-03: Ford E-Transit (Van-08), EV. Health 87%. Bengaluru Depot. Status: Available.
   - v-04: Freightliner Cascadia, Diesel. Health 64%. Status: Maintenance. Overhauling Brakes.
   - v-05: Kenworth T680, Diesel. Health 91%. Bengaluru to Chennai with David Carter. Status: On Trip.
   - v-06: Peterbilt 579, Diesel. Health 45%. Status: Emergency stop. Issues with exhaust temperature sensors.

2. DRIVERS:
   - Rajesh Kumar: Rating 4.8, Safety Score 94%, CDL active.
   - Amit Patel: Rating 4.9, Safety Score 98%, CDL active. Elite performance.
   - Michael Chang: Rating 4.5, Safety Score 88%, CDL active.
   - David Carter: Rating 4.7, Safety Score 91%, CDL active.
   - Robert Diaz: Rating 4.2, Safety Score 78%, CDL warning (Hard Braking flag).

3. KEY OPERATIONS KPIs:
   - Fleet Health Score: 88/100
   - Dijkstra Route Shortest-path Optimization is active on all dispatched trips.
   - Today's Trips: 3 In-progress, 0 scheduled.
   - July Expenses: Fuel (₹125,400), Maintenance (₹95,000), Salaries (₹380,000). Total: ₹600,400.

Help dispatchers with vehicle matching, predictive maintenance, route calculations, fuel estimations, and operational questions.
`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message: message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant proxy error:", error);
    res.status(500).json({ error: "Gemini execution failed: " + error.message });
  }
});

// Serve frontend static files
const frontendPath = path.join(process.cwd(), "frontend");
app.use(express.static(frontendPath));

// Route fallback: Serve index.html or proper HTML pages
app.get("/:page.html", (req, res, next) => {
  const pageFile = path.join(frontendPath, `${req.params.page}.html`);
  res.sendFile(pageFile, (err) => {
    if (err) next();
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TransitOps AI platform running on port ${PORT}`);
});
