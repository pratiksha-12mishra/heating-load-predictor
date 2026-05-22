# Building Heating Load Predictor

A full-stack ML web app that predicts annual heating energy 
consumption of buildings using XGBoost.

## Tech Stack
- **ML Model:** XGBoost trained on 45,000 EnergyPlus simulations
- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite

## Features
- Predict heating load from 19 architectural parameters
- Efficiency classification (High / Moderate / Low)
- Prediction history tracking
- About section with model details

## Local Setup

### Backend
cd backend
pip install -r requirements.txt
python main.py

### Frontend
cd frontend
npm install
npm run dev