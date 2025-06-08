# 🏗️ Emergency Management System – Architecture Overview

The **Emergency Management System (EMS)** is designed to help district governments and emergency response teams efficiently coordinate during flood emergencies. It supports real-time weather monitoring, AI-powered flood risk analysis, and task assignment workflows across roles: Government Officials, Command Officers, and Field Workers.

---

## 📊 High-Level System Architecture

```plaintext
 ┌────────────────────┐
 │     Frontend       │  ← Vite + React + Tailwind + TypeScript
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
## 🧑‍💼 User Value & System Benefits

This Emergency Management System is designed to be a critical, life-saving coordination tool for government agencies and NGOs during flood-related emergencies. It bridges the communication gap between decision-makers and field responders through secure, real-time collaboration, geographic intelligence, and AI insights.

---

### 🧠 For Government Officials
- **Visual Intelligence**: Instantly view flood-prone areas on an interactive GIS map.
- **Informed Decision-Making**: 3-day weather data and AI-generated flood risk zones provide actionable insights.
- **District-Level Monitoring**: Focus on specific regions for localized flood response.

---

### 📋 For Command Officers
- **Centralized Task Management**: Easily create, prioritize, and assign tasks to field teams.
- **Live Monitoring**: View real-time task completion statuses and field worker feedback.
- **Operational Oversight**: Maintain control over emergency operations from the command dashboard.

---

### 🚒 For Field Workers
- **Simplified Workflow**: View assigned tasks directly on the dashboard.
- **On-the-Ground Reporting**: Submit comments or updates after completing tasks.
- **Mobile-Friendly Access**: Lightweight UI ensures usability even in low-resource environments.

---

### 🔐 For Admins
- **Secure Access Control**: Only approved users can access dashboards through Firebase Authentication.
- **Role Verification**: Prevents misuse by ensuring that users access only their designated dashboards.
- **Scalable User Management**: Easy onboarding and permission management through Firestore.

---

### 🌐 Overall System Value
- ✅ **Security-first** design with Firebase authentication and admin role approvals.
- ✅ **AI-powered decision support** using OpenRouter LLaMA-3 to predict flood zones from weather data.
- ✅ **Real-time GIS integration** with Leaflet.js to render GeoJSON overlays for visual clarity.
- ✅ **Efficient multi-role coordination** across stakeholders in one unified platform.
- ✅ **Future-proof architecture** built with modular FastAPI backend and Vite + React frontend.

> 🛡️ This system empowers emergency responders to act faster, plan smarter, and save lives during critical flood situations.

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

### Command Officer Dashboard:
- Creates emergency response tasks.
- Assigns tasks to field workers.
- Sets task priority (High, Medium, Low).

### Field Worker Dashboard:
- Views assigned tasks in the dashboard.
- Marks tasks as complete.
- Leaves optional comments on task progress or outcome.

### Command-officer Dashboard:
- Tracks task status (Pending / Completed) for monitoring and accountability.

---

## 7. 🧩 Backend (FastAPI)

**Purpose**:  

- Flood risk prompt generation

## 8. ☁️ Firebase Firestore

**Used for**:
- Storing approved users
- Storing task details (e.g., status, assigned user, timestamps)

**Why Firebase**:
- Easy to integrate with both frontend and backend
- Provides real-time updates
- Highly scalable for large-scale emergencies

---

## 🧠 Your Overall Approach

### ✅ Problem Statement
District governments need a unified, responsive system to forecast, analyze, and respond effectively to flood emergencies.

### ✅ Design Philosophy
- Modular architecture (independent weather, task, and auth modules)
- Role-based access and workflows (Government Official, Commandofficer, Fieldworker)
- Real-time GeoJSON-based flood zone visualization
- Lightweight UI coupled with a powerful AI backend

### ✅ Key Goals Met
- Secure login with admin role approval
- Interactive GIS-based flood visualization
- Real-time task collaboration between command officer and field workers
- AI-driven flood risk insights without the need for satellite imagery

---

## 🛠️ Getting Started

Follow the steps below to clone, set up, and run the project locally.

### 📥 1. Clone the Repository

```bash
git clone https://github.com/your-username/emergency-management-system.git
cd emergency-management-system
```

## 🧪 2. Backend Setup (FastAPI + Firebase)

### 📌 Prerequisites
- Python 3.9+
- `pip` package manager
- `.env` file with the following keys:
  - `WEATHERAPI_KEY`
  - `OPENROUTER_API_KEY`
  - Firebase credentials (if using Firebase Admin SDK)

---

### 📦 Install Python Dependencies

Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 🚀 Running the Project

### 🧪 Run Backend (FastAPI) and Frontend (React) Seperately


   ```bash
   For backend:uvicorn main:app --reload
   For frontend:npm run dev
 ```
## 🖼️ Screenshots





