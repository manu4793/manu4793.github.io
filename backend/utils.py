import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'   # Suppress warnings

import yfinance as yf
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler

models = {}  # Lazy loading dict

def get_model(time_steps):
    if time_steps not in models:
        model_path = f"models/model_{time_steps}.h5"
        if os.path.exists(model_path):
            try:
                models[time_steps] = load_model(model_path)
            except Exception as e:
                print(f"Error loading model directly: {e}. Attempting to recreate and load weights.")
                # Recreate the model architecture
                model = Sequential()
                model.add(LSTM(units=50, return_sequences=True, input_shape=(time_steps, 1)))
                model.add(Dropout(0.2))
                model.add(LSTM(units=50, return_sequences=True))
                model.add(Dropout(0.2))
                model.add(LSTM(units=50))
                model.add(Dropout(0.2))
                model.add(Dense(units=1))
                # Load weights
                model.load_weights(model_path)
                models[time_steps] = model
        else:
            raise ValueError(f"No model found for time_steps={time_steps}. Run train_model.py to create it.")
    return models[time_steps]

def fetch_historical_data(ticker, period="max"):
    try:
        data = yf.download(ticker, period=period, progress=False, auto_adjust=False)
        data.columns = data.columns.get_level_values(0)
        data = data.dropna(subset=['Close'])
        if data.empty:
            return None
        return data
    except Exception:
        return None

def prepare_data_for_prediction(historical_data, time_steps):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(historical_data['Close'].values.reshape(-1, 1))
    if len(scaled_data) < time_steps:
        raise ValueError("Not enough data for prediction")
    input_data = scaled_data[-time_steps:].reshape(1, time_steps, 1)
    return input_data, scaler

def make_prediction(input_data, scaler, predict_days, time_steps):
    model = get_model(time_steps)  # Load lazily
    predictions = []
    current_input = input_data.copy()
    for _ in range(predict_days):
        pred = model.predict(current_input, verbose=0)
        predictions.append(pred[0][0])
        pred_reshaped = pred.reshape(1, 1, 1)
        current_input = np.append(current_input[:, 1:, :], pred_reshaped, axis=1)
    predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
    return predictions