from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import pandas as pd
import numpy as np
from utils import fetch_historical_data, prepare_data_for_prediction, make_prediction
from datetime import datetime
import dateutil.relativedelta
import requests  # Add this import

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    ticker: str
    period: str = "1y"
    time_steps: int = 60
    predict_days: int = 30

def calculate_rsi(series, period=14):
    delta = series.diff(1)
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return {
        'macd': macd_line,
        'signal': signal_line,
        'histogram': histogram
    }

def calculate_sma(series, period=50):
    return series.rolling(window=period).mean()

def calculate_ema(series, period=200):
    return series.ewm(span=period, adjust=False).mean()

def replace_nan_with_none(lst):
    return [None if pd.isna(x) else x for x in lst]

def replace_nan_in_indicators(indicators_data):
    for key, value in indicators_data.items():
        if isinstance(value, dict):
            for subkey, subvalue in value.items():
                value[subkey] = replace_nan_with_none(subvalue)
        else:
            indicators_data[key] = replace_nan_with_none(value)
    return indicators_data

@app.get("/search_ticker")
def search_ticker(query: str):
    if not query:
        return {"results": []}
    
    try:
        url = f"https://query1.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=15&newsCount=0"
        headers = {'User-Agent': 'Mozilla/5.0'}  # To mimic a browser and avoid blocks
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Extract and filter quotes (only EQUITY types for stocks)
        quotes = data.get('quotes', [])
        filtered_results = [
            {
                "ticker": quote['symbol'],
                "name": quote.get('longname') or quote.get('shortname') or quote['symbol'],
                "exchange": quote.get('exchange'),
                "type": quote['quoteType']
            }
            for quote in quotes if quote.get('quoteType') == 'EQUITY'  # Filter to stocks only
        ]
        
        return {"results": filtered_results[:10]}  # Limit to 10 results
    except Exception as e:
        print(f"Search error: {e}")
        return {"results": [], "error": "Failed to fetch suggestions"}
    
def read_root():
    return {"message": "Stock Prediction API is running"}

@app.post("/predict")
def predict(request: PredictionRequest):
    
    ticker = request.ticker.upper()
    time_steps = request.time_steps
    predict_days = request.predict_days

    full_historical = fetch_historical_data(ticker, period="max")

    if full_historical is None:
        return {"error": f"Could not fetch data for {ticker}"}
    
    last_date = full_historical.index[-1]
    if request.period in ["all", "max"]:
        historical_data = full_historical
    elif request.period == "ytd":
        start_date = pd.Timestamp(f"{last_date.year}-01-01")
        historical_data = full_historical[full_historical.index >= start_date]
    else:
        offset_map = {
            "1d": {"days": 1},
            "5d": {"days": 5},
            "1m": {"months": 1},
            "3m": {"months": 3},
            "6m": {"months": 6},
            "1y": {"years": 1},
            "5y": {"years": 5},
        }
        offset = offset_map.get(request.period, {"years": 1})
        start_date = last_date - dateutil.relativedelta.relativedelta(**offset)
        historical_data = full_historical[full_historical.index >= start_date]
    
    # Format historical
    historical = {
        "dates": historical_data.index.strftime("%Y-%m-%d").tolist(),
        "prices": historical_data['Close'].values.tolist()
    }

    error_msg = None
    predictions = []
    try:
        input_data, scaler = prepare_data_for_prediction(full_historical, time_steps)
        preds_array = make_prediction(input_data, scaler, predict_days, time_steps)
        predictions = preds_array.tolist()
    except Exception as e:
        print(f"Prediction error: {e}")
        error_msg = str(e)

    # Predicted dates using business days
    predicted_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=len(predictions)).strftime("%Y-%m-%d").tolist() if len(predictions) > 0 else []
    predicted = {
        "dates": predicted_dates,
        "prices": predictions
    }

    # Always compute all indicators
    indicators_data = {}
    df = historical_data.copy()
    close = df['Close']
    indicators_data['rsi'] = calculate_rsi(close).tolist()
    macd = calculate_macd(close)
    indicators_data['macd'] = {
        'macd': macd['macd'].tolist(),
        'signal': macd['signal'].tolist(),
        'histogram': macd['histogram'].tolist()
    }
    indicators_data['sma50'] = calculate_sma(close, 50).tolist()
    indicators_data['ema200'] = calculate_ema(close, 200).tolist()

    # Replace NaN with None for JSON compatibility
    indicators_data = replace_nan_in_indicators(indicators_data)

    response = {
        "historical": historical,
        "predicted": predicted,
        "indicators": indicators_data
    }
    if error_msg:
        response["error"] = error_msg
    
    return response

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)