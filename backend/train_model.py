import yfinance as yf
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import os

tickers = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL']

all_scaled = []
scaler = MinMaxScaler()

for ticker in tickers:
    data = yf.download(ticker, period='5y', auto_adjust=False)
    data.columns = data.columns.get_level_values(0)
    data = data.dropna(subset=['Close'])
    prices = data['Close'].values.reshape(-1, 1)
    scaled = scaler.fit_transform(prices)
    all_scaled.append(scaled)

combined_scaled = np.concatenate(all_scaled, axis=0)

# Define all your desired time step values
time_step_options = [3780]

for TIME_STEPS in time_step_options:
    print(f"\nTraining model for TIME_STEPS = {TIME_STEPS}")

    X, y = [], []
    for i in range(TIME_STEPS, len(combined_scaled)):
        X.append(combined_scaled[i-TIME_STEPS:i, 0])
        y.append(combined_scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    model = Sequential()
    model.add(LSTM(100, return_sequences=True, input_shape=(TIME_STEPS, 1)))
    model.add(Dropout(0.2))
    model.add(LSTM(100))
    model.add(Dropout(0.2))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')

    history = model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test))

    test_loss = model.evaluate(X_test, y_test)
    print(f"Test Loss for TIME_STEPS = {TIME_STEPS}: {test_loss}")

    # Save model for this time step
    model.save(f'model_{TIME_STEPS}.h5')

    print(f"Model for TIME_STEPS = {TIME_STEPS} saved as model_{TIME_STEPS}.h5")

print("All models trained and saved!")
