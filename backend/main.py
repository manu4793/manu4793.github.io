from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from utils import fetch_historical_data, prepare_data_for_prediction, make_prediction

app = FastAPI()

class PredictionRequest(BaseModel):
    ticker: str

@app.get("/")
def read_root():
    return {"message": "Stock Prediction API is running"}

@app.post("/predict")
def predict(request: PredictionRequest):
    ticker = request.ticker.upper()
    
    # Fetch historical data (real via yfinance)
    historical_data = fetch_historical_data(ticker)
    if historical_data is None:
        return {"error": f"Could not fetch data for {ticker}"}
    
    # Prepare input for model (e.g., last 60 days)
    input_data, scaler = prepare_data_for_prediction(historical_data)
    
    # Make prediction (e.g., next 5 days)
    predictions = make_prediction(input_data, scaler)
    
    # Format response
    historical = {
        "dates": historical_data.index.strftime("%Y-%m-%d").tolist()[-30:],  # Last 30 days for brevity
        "prices": historical_data['Close'].values[-30:].tolist()
    }
    predicted_dates = [(historical_data.index[-1] + pd.Timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(len(predictions))]
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