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
