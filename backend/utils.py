import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

MODEL_PATH = "model.keras"  # Updated to native Keras format
TIME_STEPS = 60  # Assuming model uses last 60 days for prediction
PREDICT_DAYS = 5  # Predict next 5 days

def fetch_historical_data(ticker):
    try:
        data = yf.download(ticker, period="1y", progress=False)
        if data.empty:
            return None
        return data
    except Exception:
        return None

def prepare_data_for_prediction(historical_data):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(historical_data['Close'].values.reshape(-1, 1))
    
    if len(scaled_data) < TIME_STEPS:
        raise ValueError("Not enough data for prediction")
    
    input_data = scaled_data[-TIME_STEPS:].reshape(1, TIME_STEPS, 1)
    return input_data, scaler

def make_prediction(input_data, scaler):
    model = load_model(MODEL_PATH)
    predictions = []
    current_input = input_data.copy()
    
    for _ in range(PREDICT_DAYS):
        pred = model.predict(current_input, verbose=0)
        predictions.append(pred[0][0])
        pred_reshaped = pred.reshape(1, 1, 1)
        current_input = np.append(current_input[:, 1:, :], pred_reshaped, axis=1)
    
    predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
    return predictions