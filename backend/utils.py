import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  # Force CPU-only
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'   # Suppress warnings

import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

MODEL_PATH = "model.h5"  # Change to .h5

TIME_STEPS = 60
PREDICT_DAYS = 30

def fetch_historical_data(ticker, period="1y"):
    try:
        data = yf.download(ticker, period=period, progress=False, auto_adjust=False)
        data.columns = data.columns.get_level_values(0)
        data = data.dropna(subset=['Close'])
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