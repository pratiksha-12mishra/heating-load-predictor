from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn

# ── Load model files
model         = joblib.load('heating_model.pkl')
scaler        = joblib.load('scaler.pkl')
feature_names = joblib.load('feature_names.pkl')

print("✅ Model loaded!")
print(f"✅ Features ({len(feature_names)}): {feature_names}")

app = FastAPI()

# ── CORS — allow React to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Input model — all 24 features
class BuildingFeatures(BaseModel):
    window               : float
    floor_insulation     : float
    roof_insulation      : float
    orientation          : float
    lighting_density     : float
    occupancy_density    : float
    equipment_density    : float
    HSPT                 : float
    hvac_efficiency      : float
    flowINF              : float
    wall_insulation      : float
    met_rate             : float
    clo                  : float
    shgc                 : float
    wwr                  : float
    overhang             : float
    OpenTime             : float
    CloseTime            : float
    WindowOpen           : float
    window_x_wwr         : float
    insulation_combined  : float
    occupancy_x_equipment: float
    hvac_x_flow          : float
    open_duration        : float

@app.get("/")
def home():
    return {
        "status"  : "API is running",
        "model"   : "XGBoost",
        "features": len(feature_names)
    }

@app.post("/predict")
def predict(data: BuildingFeatures):
    try:
        input_dict  = data.dict()

        # Build array in exact same order as training
        input_array = np.array([[
            input_dict[f] for f in feature_names
        ]])

        # Scale
        scaled = scaler.transform(input_array)

        # Predict
        prediction = float(model.predict(scaled)[0])

        # Classify efficiency
        if prediction < 5000:
            label = "Highly Efficient"
            tip   = "Excellent insulation and HVAC performance."
            color = "green"
        elif prediction < 15000:
            label = "Moderately Efficient"
            tip   = "Consider improving wall or roof insulation."
            color = "yellow"
        else:
            label = "Low Efficiency"
            tip   = "Major improvements needed in insulation and HVAC."
            color = "red"

        return {
            "status"          : "success",
            "heating_load_kwh": round(prediction, 2),
            "efficiency_label": label,
            "recommendation"  : tip,
            "color"           : color
        }

    except Exception as e:
        return {
            "status" : "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )