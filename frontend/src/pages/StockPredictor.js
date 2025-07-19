import React, { useState } from "react";
import axios from "axios";
import StockChart from "../components/StockChart.js";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://manu4793-github-io.onrender.com"
    : "http://localhost:8000";

const popularStocks = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'META', name: 'Meta Platforms, Inc.' },
  { ticker: 'AVGO', name: 'Broadcom Inc.' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor Manufacturing Company Limited' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
  { ticker: 'WMT', name: 'Walmart Inc.' },
  { ticker: 'LLY', name: 'Eli Lilly and Company' },
  { ticker: 'ORCL', name: 'Oracle Corporation' },
  { ticker: 'V', name: 'Visa Inc.' },
  { ticker: 'NFLX', name: 'Netflix, Inc.' },
  { ticker: 'MA', name: 'Mastercard Incorporated' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
  { ticker: 'COST', name: 'Costco Wholesale Corporation' },
  { ticker: 'JNJ', name: 'Johnson & Johnson' },
];

function StockPredictor() {
  const [ticker, setTicker] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);

    if (!value) {
      setSuggestions([]); // Hide suggestions if empty
    } else {
      const filtered = popularStocks.filter(
        (stock) =>
          stock.ticker.toUpperCase().startsWith(value) ||
          stock.name.toUpperCase().includes(value)
      );
      setSuggestions(filtered);
    }
  };

  const handleSelectSuggestion = (selectedTicker) => {
    setTicker(selectedTicker);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSuggestions([]); // Clear suggestions on submit

    try {
      const response = await axios.post(`${BACKEND_URL}/predict`, { ticker });
      setData(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        width: "100%",
        margin: "20px auto",
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: "white",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Stock Price Predictor</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <input
          type="text"
          value={ticker}
          onChange={handleInputChange}
          placeholder="Enter stock ticker or company name (e.g., AAPL)"
          required
          style={{ marginBottom: "10px", width: "100%", maxWidth: "400px", padding: "8px" }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              border: "1px solid #ccc",
              backgroundColor: "white",
              position: "absolute",
              top: "40px",
              width: "100%",
              maxWidth: "400px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 1,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {suggestions.map((stock) => (
              <li
                key={stock.ticker}
                onClick={() => handleSelectSuggestion(stock.ticker)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {stock.name} ({stock.ticker})
              </li>
            ))}
          </ul>
        )}
        <button type="submit" style={{ width: "100%", maxWidth: "400px", padding: "8px" }}>Predict</button>
      </form>
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {data && (
        <div
          style={{
            maxWidth: "800px",
            width: "100%",
            margin: "20px auto",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "white",
          }}
        >
          {data.historical && data.historical.prices.length === 0 && (
            <p style={{ color: "orange", textAlign: "center" }}>No historical prices available. Check backend data.</p>
          )}
          <div style={{ height: "400px" }}> {/* Fixed height for better control on mobile */}
            <StockChart historical={data.historical} predicted={data.predicted} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StockPredictor;