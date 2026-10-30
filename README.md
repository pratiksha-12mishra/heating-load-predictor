# 🏢 Building Energy Efficiency Predictor

<div align="center">

![API Status](https://img.shields.io/badge/API-Online-brightgreen)
![Model](https://img.shields.io/badge/Model-XGBoost-orange)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-teal)
![Deployed](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black)

**Predict annual heating energy consumption of buildings from architectural parameters — powered by XGBoost trained on 45,000 EnergyPlus simulations.**

[🚀 Live Demo](https://heating-load-predictor-9c8w.vercel.app/) • [📊 API Endpoint](https://heating-load-predictor.onrender.com)

</div>

---

## 📸 Screenshots

| Predict Tab | Results | History | About |
|---|---|---|---|
| Input 19 parameters across 3 categories | Grade + kWh/yr output with efficiency bar | Track all past predictions | Model & feature documentation |

---

## ✨ Features

- **ML Prediction** — Instant heating load estimates from 19 architectural parameters
- **Efficiency Grading** — A–F grade with color-coded classification (High / Moderate / Low)
- **Actionable Recommendations** — Context-aware tips like "Consider improving wall or roof insulation"
- **Prediction History** — Session-based history with timestamps, accessible from the History tab
- **API Health Indicator** — Real-time green/red status badge showing backend connectivity
- **Sample Values** — One-click fill with realistic building parameters for quick testing
- **Responsive UI** — Clean dark-themed interface built with React + Vite

---

## 🧠 ML Model

| Property | Detail |
|---|---|
| Algorithm | XGBoost (Gradient Boosted Trees) |
| Training Data | 45,000 EnergyPlus building energy simulations |
| Input Features | 24 engineered features from 19 raw parameters |
| Target | Annual Heating Load (kWh/year) |
| Backend | FastAPI serving the trained `.pkl` model |

### Efficiency Classification

| Grade | Range | Label |
|---|---|---|
| 🟢 A | Below 5,000 kWh/yr | Highly Efficient |
| 🟠 B–C | 5,000 – 15,000 kWh/yr | Moderately Efficient |
| 🔴 D–F | Above 15,000 kWh/yr | Low Efficiency |

---

## 🏗️ Input Parameters

### Building Envelope
`Window Type` · `Floor Insulation` · `Roof Insulation` · `Wall Insulation` · `Window-Wall Ratio` · `Solar Heat Gain` · `Overhang Depth` · `Orientation`

### HVAC & Systems
`HVAC Efficiency` · `Heating Setpoint (°C)` · `Air Infiltration` · `Window Open %` · `Open Hour` · `Close Hour`

### Occupancy & Internal Loads
`Occupancy Density` · `Equipment Density` · `Lighting Density` · `MET Rate` · `Net Data`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| ML Model | XGBoost + scikit-learn + pandas |
| Backend | Python · FastAPI · Uvicorn |
| Frontend | React 18 · Vite · CSS Modules |
| Deployment | Vercel (frontend) · Render (backend) |
| Version Control | Git · GitHub |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# API running at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
# App running at http://localhost:5173
```

---

## 📡 API Reference

### Health Check
```
GET /
→ { "status": "API is running", "model": "XGBoost", "features": 24 }
```

### Predict Heating Load
```
POST /predict
Content-Type: application/json

{
  "window_type": 2,
  "floor_insulation": 0.3,
  "roof_insulation": 0.2,
  ...
}

→ { "heating_load": 7752.21, "grade": "B", "label": "Moderately Efficient" }
```

---

## 📁 Project Structure

```
heat-prediction-app/
├── backend/
│   ├── main.py              # FastAPI app + /predict endpoint
│   ├── model.pkl            # Trained XGBoost model
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app with tab routing
│   │   ├── components/      # PredictForm, ResultCard, History, About
│   │   └── api.js           # Axios API calls
│   ├── .env.production      # VITE_API_URL for Vercel
│   └── vite.config.js
└── README.md
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://heating-load-predictor-9c8w.vercel.app |
| Backend | Render (Free Tier) | https://heating-load-predictor.onrender.com |

> **Note:** The Render free tier may sleep after 15 minutes of inactivity. The first request may take 30–60 seconds to wake the server. The API Online/Offline badge in the app header reflects live backend status.

---

## 👩‍💻 Author

**Pratiksha Mishra**  
[GitHub](https://github.com/pratiksha-12mishra) · [LinkedIn](https://linkedin.com/in/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
