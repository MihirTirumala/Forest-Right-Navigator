<!-- PROJECT LOGO & BANNER -->
<br />
<div align="center">
  <!-- Place your Banner Image URL here -->
  <a href="https://github.com/MihirTirumala/Forest-Right-Navigator">
    <img src="[INSERT_BANNER_IMAGE_URL_HERE]" alt="Project Banner" width="100%">
  </a>
  <br />
  <br />
  
  <!-- Place your Logo URL here -->
  <a href="https://github.com/MihirTirumala/Forest-Right-Navigator">
    <img src="[INSERT_LOGO_IMAGE_URL_HERE]" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Forest Rights Act (FRA) Decision Support & AI Compliance Engine</h3>

  <p align="center">
    An end-to-end full-stack platform for monitoring Forest Rights Act (FRA) claim throughput, detecting spatial/administrative anomalies, and providing live AI-synthesized compliance briefings powered by Django REST Framework and Groq LLM API.
    <br />
    <br />
    <a href="[INSERT_LIVE_DEPLOYED_LINK_HERE]"><strong>View Live Demo »</strong></a>
    ·
    <a href="https://github.com/MihirTirumala/Forest-Right-Navigator/issues">Report Bug</a>
    ·
    <a href="https://github.com/MihirTirumala/Forest-Right-Navigator/issues">Request Feature</a>
  </p>
</div>

---

## 🏗️ System Architecture & Stack

```text
               ┌────────────────────────────────────────────────────────┐
               │              Vite + React 19 Frontend                  │
               │   (Leaflet GIS Map, Recharts, TanStack Router, UI)     │
               └──────────────────────────┬─────────────────────────────┘
                                          │  REST HTTP / JSON
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │                 Django 6.1 Backend                     │
               │      (ORM Models, Aggregation Engine, REST API)        │
               └──────────────┬───────────────────────────┬─────────────┘
                              │                           │
                              ▼                           ▼
                     SQLite Database             Groq LLM API
                     (db.sqlite3)           (llama-3.3-70b-versatile)
```

* **Backend**: Django 6.1.1, Django REST Framework, SQLite DB, `django-cors-headers`, `requests`.
* **AI Engine**: Groq Inference API (`llama-3.3-70b-versatile` / `groq/compound-mini`) with rule-based fallback.
* **Frontend**: Vite 8, React 19, TypeScript, Leaflet GIS, Recharts, Tailwind CSS, TanStack Router.

---

## 📸 Gallery & Interface

<!-- Place your screenshots here -->

| Landing Page | Analytics Dashboard |
| :---: | :---: |
| <img src="[INSERT_LANDING_PAGE_SCREENSHOT_URL]" alt="Landing Page" width="400"> | <img src="[INSERT_DASHBOARD_SCREENSHOT_URL]" alt="Dashboard" width="400"> |
| *Seamless infinite marquee and minimalist hero design.* | *Real-time KPI metrics and status breakdowns.* |

| GIS Mapping View | Anomaly Detection |
| :---: | :---: |
| <img src="[INSERT_MAP_SCREENSHOT_URL]" alt="Map View" width="400"> | <img src="[INSERT_ANOMALY_SCREENSHOT_URL]" alt="Anomaly Rules" width="400"> |
| *Geospatial claim clustering and interactive state tooltips.* | *Automated flags for overlapping boundaries and missing docs.* |

---

## 📁 Repository Structure

```text
FRA/
├── claims/                 # Django Claims App (Models, Views, Services, URLs, Tests)
│   ├── models.py           # Claim model (IFR, CFR, CR, coordinates, dates, status)
│   ├── services.py         # AI Audit Risk Engine & Groq Integration
│   ├── views.py            # REST API Endpoint handlers
│   ├── urls.py             # App URL Routing
│   └── tests.py            # 17 Automated Unit Tests
├── fra_backend/            # Django Core Configuration (settings, urls, wsgi)
├── frontend/               # React Web Application (Vite + TS + Leaflet)
│   ├── src/
│   │   ├── lib/api-client.ts   # API Client Library for Django Backend
│   │   ├── lib/filter-store.tsx# Global Claims Store & Filters
│   │   └── routes/anomalies.tsx# Live Groq AI Compliance Card & Anomaly Review
├── .env                    # Environment variables (GROQ_API_KEY)
├── .gitignore              # Git exclusions (.env, db.sqlite3, venv, node_modules)
├── seed.py                 # Database seeder (6 demonstration scenarios)
└── manage.py               # Django Management CLI
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

> 🔒 **Security Note**: `.env` is listed in `.gitignore` so your API key will never be committed to Git.

---

## 🚀 How to Run Locally

### 1. Start the Django Backend Server
```powershell
# From the project root (c:\Users\Lenovo\Documents\FRA)
.\venv\Scripts\python.exe manage.py runserver 8000
```
Backend API will be live at: `http://127.0.0.1:8000/claims/api/`

---

### 2. Start the React Frontend Web Dashboard
Open a new terminal window:
```powershell
cd frontend
npm run dev
```
Frontend App will be live at: `http://localhost:5173/`

* Open **`http://localhost:5173/anomalies`** to view the **Live Groq AI District Compliance Auditor**!

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/claims/api/overview/` | `GET` | National aggregate metrics, status counts, & risk distribution |
| `/claims/api/districts/` | `GET` | List of distinct states and districts with risk scores |
| `/claims/api/claims/` | `GET` | Paginated & filterable list of individual claims |
| `/claims/api/claims/<id>/` | `GET` | Single claim details by numeric ID or string `claim_id` |
| `/claims/api/district-audit/` | `GET` | AI audit analysis for `?state=...&district=...` |
| `/claims/api/audit/` | `POST` | Triggers AI audit via JSON payload `{"state": "...", "district": "..."}` |
| `/claims/api/geojson/` | `GET` | GeoJSON FeatureCollection format for GIS map pins |

---

## 🧪 Running Automated Unit Tests

Run the backend test suite (17 tests covering ORM models, risk math, AI fallbacks, and API views):

```powershell
.\venv\Scripts\python.exe manage.py test claims
```

Output:
```text
Ran 17 tests in 10.320s
OK
```

---

## 👥 Contributors

This project was built by a dedicated team of developers. 

| Name | Role / Title | ID / Roll Number | GitHub |
| :--- | :--- | :--- | :--- |
| **Advay** | Frontend Developer & UI/UX | `[EDIT_ROLL_NO]` | `[EDIT_GITHUB_LINK]` |
| **Mihir** | Fullstack Architecture | `[EDIT_ROLL_NO]` | [@MihirTirumala](https://github.com/MihirTirumala) |
| **Krishanu** | Backend & Data Engineering | `[EDIT_ROLL_NO]` | `[EDIT_GITHUB_LINK]` |
