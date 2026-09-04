# Forest Rights Navigator

Build the complete working FRA Monitor – Forest Rights Act Decision Support System described by the user. Use the attached UI references as visual direction: polished desktop-first government analytics dashboard, light surfaces, dark forest/emerald accents, clean cards, sidebar and header. Include realistic synthetic 500–1000 claim dataset, separated data layer, transparent anomaly rules, Leaflet/OpenStreetMap GIS map with mock/simplified GeoJSON boundaries, interactive filters that update KPIs/map/charts, dashboard, FRA Claims, Anomalies, AI Insights, State Performance pages, claim detail and district panels, advisory-only data-grounded AI summaries and assistant. Ensure all key demo scenarios exist, interactions work, and clearly label synthetic demo data and human-review-only recommendations.



## Development Setup

### 1. Repository Setup
Clone the repository and install the frontend dependencies (Node.js and npm required):
```sh
git clone <this-repository-url>
cd <repository-name>
npm i
```

### 2. Environment Variables
To run AI features, you will need a Groq API Key.
1. Copy the `.env.example` file (if available) or create a new `.env` file in the root directory.
2. Add your API key:
```env
GROQ_API_KEY="your_api_key_here"
```
*(Note: `.env` is ignored by Git to keep your keys safe).*

### 3. Running the Frontend
Start the frontend development server:
```sh
npm run dev
```

### 4. Folder Structure
- `src/` & `public/`: Frontend React application
- `backend/`: API services and database integrations
- `data/`: Datasets (e.g. synthetic claim data)
- `scripts/`: Utilities and setup scripts
