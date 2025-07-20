import yfinance as yf
import numpy as np
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import os

# Expanded tickers: Mix of mega, large, mid, and small caps for diversity
tickers = [
    'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'WMT', 'XOM', 'PYPL', 'ZS', 'PLTR', 'AEO', 'JBLU'
]

all_prices = [] # Collect raw prices first, then scale combined

for ticker in tickers:
    try:
        data = yf.download(ticker, period='15y', auto_adjust=False)
        if data.empty:
            print(f"No data for {ticker}, skipping.")
            continue
        data.columns = data.columns.get_level_values(0)
        data = data.dropna(subset=['Close'])
        prices = data['Close'].values.reshape(-1, 1)
        all_prices.append(prices)
    except Exception as e:
        print(f"Failed to get {ticker}: {e}")

combined_prices = np.concatenate(all_prices, axis=0)

# Scale the combined data
scaler = MinMaxScaler(feature_range=(0, 1))
combined_scaled = scaler.fit_transform(combined_prices)

# List of TIME_STEPS to train (matching frontend predictDaysOptions)
TIME_STEPS_LIST = [1, 5, 10, 20, 60, 120]

def create_model(time_steps):
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=(time_steps, 1)))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50))
    model.add(Dropout(0.2))
    model.add(Dense(units=1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

for TIME_STEPS in TIME_STEPS_LIST:
    print(f"\nTraining for TIME_STEPS = {TIME_STEPS}")

    X, y = [], []
    for i in range(TIME_STEPS, len(combined_scaled)):
        X.append(combined_scaled[i - TIME_STEPS:i, 0])
        y.append(combined_scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    if len(X) == 0:
        print(f"Not enough data for TIME_STEPS={TIME_STEPS}, skipping.")
        continue

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model_path = f'models/model_{TIME_STEPS}.h5'

    if os.path.exists(model_path):
        model = load_model(model_path)
        print(f"Loaded existing model {model_path}")
        epochs = 10 # Fine-tune with fewer epochs
    else:
        model = create_model(TIME_STEPS)
        print(f"Created new model for {TIME_STEPS}")
        epochs = 50 # Train new model with more epochs

    # Train or fine-tune
    history = model.fit(X_train, y_train, epochs=epochs, batch_size=32, validation_data=(X_test, y_test))

    test_loss = model.evaluate(X_test, y_test)
    print(f"Test Loss after training: {test_loss}")

    # Save the model (overwrite)
    model.save(model_path)
    print(f"Model saved as {model_path}")

print("Model training complete for all TIME_STEPS!")