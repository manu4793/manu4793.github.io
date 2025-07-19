from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import pandas as pd
from utils import fetch_historical_data, prepare_data_for_prediction, make_prediction
from datetime import datetime
import dateutil.relativedelta  # Add this for relative date offsets

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    ticker: str
    period: str = "1y"  # Default to 1 year

@app.get("/")
def read_root():
    return {"message": "Stock Prediction API is running"}

@app.post("/predict")
def predict(request: PredictionRequest):
    ticker = request.ticker.upper()
    
    # Fetch full historical data
    full_historical = fetch_historical_data(ticker, period="max")
    if full_historical is None:
        return {"error": f"Could not fetch data for {ticker}"}
    
    # Determine start date based on period
    last_date = full_historical.index[-1]
    if request.period == "all":
        historical_data = full_historical
    elif request.period == "ytd":
        start_date = pd.Timestamp(f"{last_date.year}-01-01")
        historical_data = full_historical[full_historical.index >= start_date]
    else:
        offset_map = {
            "1d": {"days": 1},
            "5d": {"days": 5},
            "1m": {"months": 1},
            "6m": {"months": 6},
            "1y": {"years": 1},
            "5y": {"years": 5},
        }
        offset = offset_map.get(request.period, {"years": 1})  # Default 1y
        start_date = last_date - dateutil.relativedelta.relativedelta(**offset)
        historical_data = full_historical[full_historical.index >= start_date]
    
    # Prepare input for model using full data (last 60 days)
    input_data, scaler = prepare_data_for_prediction(full_historical)
    
    # Make prediction (next 30 days)
    predictions = make_prediction(input_data, scaler)
    
    # Format response
    historical = {
        "dates": historical_data.index.strftime("%Y-%m-%d").tolist(),
        "prices": historical_data['Close'].values.tolist()
    }
    # Predicted dates using business days
    predicted_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=90).strftime("%Y-%m-%d").tolist()
    predicted = {
        "dates": predicted_dates,
        "prices": predictions.tolist()
    }
    
    return {
        "historical": historical,
        "predicted": predicted
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)