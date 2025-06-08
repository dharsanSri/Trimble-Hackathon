# 🏗️ Emergency Management System – Architecture Overview

The **Emergency Management System (EMS)** is designed to help district governments and emergency response teams efficiently coordinate during flood emergencies. It supports real-time weather monitoring, AI-powered flood risk analysis, and task assignment workflows across roles: Government Officials, Command Officers, and Field Workers.

---

## 📊 High-Level System Architecture

```plaintext
 ┌────────────────────┐
 │     Frontend       │  ← Vite + React + Tailwind
 └────────┬───────────┘
          │
          ▼
 ┌──────────────────────────────┐
 │  FastAPI Backend (REST API) │
 └────────┬─────────────┬──────┘
          │             │
          ▼             ▼
 ┌────────────────┐  ┌────────────────────┐
 │ Firebase Auth  │  │ External APIs       │
 │ (user mgmt +   │  │ - WeatherAPI.com    │
 │  role approval)│  │ - OpenRouter AI     │
 └────────────────┘  └────────────────────┘
          │
          ▼
 ┌─────────────────────┐
 │      Database       │ ← Firebase Firestore (User + Task Data)
 └─────────────────────┘
```
# 🗂️ Project Code Structure – Emergency Management System

The following structure outlines the organization of the Emergency Management System project, which is divided into backend and frontend parts for clear separation of concerns.

---

## 📁 Root Directory

```bash
TRIMBLE-HACKATHON/
│
├── backend/                  # FastAPI Backend
│   ├── __pycache__/         # Python bytecode cache
│   ├── static/              # Static files (e.g. CSS, JS)
│   ├── templates/           # HTML Jinja2 templates
│   ├── venv/                # Python virtual environment (not in git)
│   ├── ADMIN_INSTRUCTIONS.md
│   ├── logins.txt           # (Temporary login info or log)
│   └── main.py              # Entry point for FastAPI server
│
├── frontend/                # React Frontend (Vite + TypeScript)
│   ├── node_modules/        # Frontend dependencies (excluded in git)
│   ├── public/              # Static assets like icons, index.html
│   └── src/                 # Application source code
│       ├── components/      # Reusable React components (UI)
│       ├── hooks/           # Custom React hooks (state, effects)
│       ├── lib/             # Utility/helper functions
│       ├── pages/           # Page-level React components (routes)
│       ├── services/        # External service handlers
│       │   ├── districtBoundingBoxService.ts
│       │   ├── floodRiskAI.ts
│       │   ├── floodZoneService.js
│       │   └── weatherService.ts
│       ├── App.css
│       ├── App.tsx          # Main app component
│       ├── firebase.ts      # Firebase config and auth setup
│       ├── index.css
│       ├── main.tsx         # Entry point for React app
│       └── vite-env.d.ts
│
├── .env                     # Environment variables (API keys, etc.)
├── .gitignore
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html               # HTML entry point for Vite
├── package.json             # Frontend dependencies and scripts
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts       # TailwindCSS customization
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts           # Vite configuration
```
## 🔄 Project Workflow

```plaintext
+--------------------------+
|     User Login Page     | ← Firebase Authentication
+--------------------------+
           |
           v
+--------------------------+
|   Admin Role Approval    | ← Admin must approve each user
+--------------------------+
           |
           v
+--------------------------+
|   Role-Based Dashboard   |
+--------------------------+
   |         |         |
   v         v         v
+---------+ +--------+ +-------------------+
| Govt.   | | Cmd Of | | Field Worker      |
| Officer | | ficer  | | Dashboard         |
+---------+ +--------+ +-------------------+
   |         |             |
   |         |             +-- View & Complete Tasks
   |         +-- Assign Tasks to Field Workers
   +-- View Weather & Flood Maps
```
---
## 1. 🔐 Authentication System (Firebase)

**What it does**:  
Secures login and restricts role-based access.

**How it works**:  
Uses Firebase Authentication to ensure only verified and approved users can log in.

**Admin Layer**:  
Admin reviews and approves users via Firestore before they gain access.

## 2. 🧭 Frontend (React + Vite + TailwindCSS + TypeScript)

**UI Framework**:  
Built using Vite for fast builds and React for a dynamic interface.

**Styling**:  
TailwindCSS combined with ShadCN-UI ensures a responsive, modern UI.

**Role-specific Dashboards**:
- **Government Official**: Views 3-day weather forecasts & AI-predicted flood risk maps.
- **Command Officer**: Creates, assigns, and tracks emergency response tasks.
- **Field Worker**: Views assigned tasks, marks them as completed, and adds comments.

---

## 3. 🌦️ Weather Service Integration

**API Used**:  
[WeatherAPI.com](https://weatherapi.com)

**Purpose**:  
Fetches historical and current weather data (temperature, rainfall, humidity).

**Usage**:  
3-day history is used as input to the AI model for flood prediction.

---

## 4. 🧠 Flood Risk Prediction (OpenRouter AI + LLaMA 3)

**Prompt-Based AI**:  
Sends weather history and district name to OpenRouter API with a domain-specific hydrology prompt.

**Output**:  
GeoJSON map with risk levels — `High`, `Moderate`, and `Low` — by region.

**Why it matters**:  
Helps government officials visually identify flood-prone zones for better preparedness and resource allocation.

---

## 5. 🗺️ GIS and Mapping (Leaflet + GeoJSON)

**Frontend Tool**:  
[Leaflet.js](https://leafletjs.com)

**Purpose**:  
Visualizes flood risk zones using color-coded overlays on a map.

**Integration**:  
GeoJSON output from OpenRouter AI is rendered in real-time on the dashboard.

---

## 6. ✅ Task Management Workflow

### Command Officer:
- Creates emergency response tasks.
- Assigns tasks to field workers.
- Sets task priority (High, Medium, Low).

### Field Worker:
- Views assigned tasks in the dashboard.
- Marks tasks as complete.
- Leaves optional comments on task progress or outcome.

### Command Dashboard:
- Tracks task status (Pending / Completed) for monitoring and accountability.

---


