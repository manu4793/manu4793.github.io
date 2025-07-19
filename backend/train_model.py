import yfinance as yf
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler

# Fetch data
data = yf.download('AAPL', period='5y')
scaler = MinMaxScaler()
scaled = scaler.fit_transform(data['Close'].values.reshape(-1, 1))

# Prepare sequences (assuming TIME_STEPS=60)
X, y = [], []
for i in range(60, len(scaled)):
    X.append(scaled[i-60:i, 0])
    y.append(scaled[i, 0])
X, y = np.array(X), np.array(y)
X = X.reshape(X.shape[0], X.shape[1], 1)

# Build model
model = Sequential()
model.add(LSTM(50, return_sequences=True, input_shape=(60, 1)))
model.add(LSTM(50))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')

# Train
model.fit(X, y, epochs=50, batch_size=32)

# Save in native Keras format
model.save('model.keras')