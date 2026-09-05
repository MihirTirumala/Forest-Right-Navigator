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

  <h3 align="center">Forest Rights Act (FRA) Monitor</h3>

  <p align="center">
    A minimalist, high-performance SaaS Decision Support System for monitoring Forest Rights implementation across India.
    <br />
    <br />
    <a href="[INSERT_LIVE_DEPLOYED_LINK_HERE]"><strong>View Live Demo »</strong></a>
    ·
    <a href="https://github.com/MihirTirumala/Forest-Right-Navigator/issues">Report Bug</a>
    ·
    <a href="https://github.com/MihirTirumala/Forest-Right-Navigator/issues">Request Feature</a>
  </p>
</div>

<!-- BADGES -->
<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Django-Backend-092E20?style=for-the-badge&logo=django" alt="Django" />
</div>

---

## 📖 About The Project

<!-- Place your main dashboard screenshot here -->
[![Product Name Screen Shot][INSERT_MAIN_DASHBOARD_SCREENSHOT_URL_HERE]]([INSERT_LIVE_DEPLOYED_LINK_HERE])

The **FRA Monitor** is a powerful spatial and analytical decision-support platform designed to streamline and monitor the implementation of the Forest Rights Act. Built with a sleek, minimalist SaaS aesthetic, the platform is capable of processing thousands of synthetic land claims in real-time, offering policymakers, district collectors, and state officials unparalleled insight into claim throughput and spatial anomalies.

### ✨ Key Features

* **Real-time Analytics Dashboard**: Instant visibility into KPI metrics including Title Grant Rates, Rejection Rates, and Pending Claim bottlenecks (`O(N)` optimized for hyper-fast client-side filtering).
* **Geospatial Mapping (GIS)**: Interactive cluster mapping and heatmaps to visualize claim distributions across states and districts using Leaflet.
* **Algorithmic Anomaly Detection**: Automated rule-based flagging system for overlapping boundaries, missing resolutions, or suspicious geographic claim densities.
* **AI Compliance Briefs**: Auto-generated advisory insights outlining district-level statutory compliance and priority intervention areas.
* **Performance-First UI**: Built on React 18 Concurrent mode (`useTransition`) with debounced inputs ensuring the UI remains perfectly responsive even when crunching massive datasets.

---

## 🚀 Built With

This project relies on a modern, high-performance tech stack:

* **Frontend**: React 18, Vite, TypeScript
* **Styling**: Tailwind CSS v4, Lucide Icons, Shadcn UI
* **State & Routing**: TanStack Router, Custom Context Providers
* **Mapping & Charts**: Leaflet, Recharts
* **Backend**: Django (Python)

---

## 📸 Gallery & Interface

Here is a quick look at the different modules of the FRA Monitor:

| Landing Page | Analytics Dashboard |
| :---: | :---: |
| <img src="[INSERT_LANDING_PAGE_SCREENSHOT_URL]" alt="Landing Page" width="400"> | <img src="[INSERT_DASHBOARD_SCREENSHOT_URL]" alt="Dashboard" width="400"> |
| *Seamless infinite marquee and minimalist hero design.* | *Real-time KPI metrics and status breakdowns.* |

| GIS Mapping View | Anomaly Detection |
| :---: | :---: |
| <img src="[INSERT_MAP_SCREENSHOT_URL]" alt="Map View" width="400"> | <img src="[INSERT_ANOMALY_SCREENSHOT_URL]" alt="Anomaly Rules" width="400"> |
| *Geospatial claim clustering and interactive state tooltips.* | *Automated flags for overlapping boundaries and missing docs.* |

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18+)
* Python (3.10+)

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/MihirTirumala/Forest-Right-Navigator.git
   cd Forest-Right-Navigator
   ```

2. **Start the Frontend**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

3. **Start the Backend**
   ```sh
   # From the project root directory
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py runserver 8000
   ```

4. Open `http://localhost:5173` in your browser.

---

## 👥 Contributors

This project was built by a dedicated team of developers. 

| Name | Role / Title | ID / Roll Number | GitHub |
| :--- | :--- | :--- | :--- |
| **Advay** | Frontend Developer & UI/UX | `[EDIT_ROLL_NO]` | `[EDIT_GITHUB_LINK]` |
| **Mihir** | Fullstack Architecture | `[EDIT_ROLL_NO]` | [@MihirTirumala](https://github.com/MihirTirumala) |
| **Krishanu** | Backend & Data Engineering | `[EDIT_ROLL_NO]` | `[EDIT_GITHUB_LINK]` |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <p>Designed and built with 💻 and ☕ by the FRA Monitor Team</p>
</div>
