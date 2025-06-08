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
