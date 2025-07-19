import React, { useState } from "react";
import axios from "axios";
import StockChart from "../components/StockChart.js";
import { Helmet } from "react-helmet";

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

const timeStepOptions = [
  { label: '1 Day', value: 1 },
  { label: '5 Days', value: 5 },
  { label: '1 Month', value: 20 },
  { label: '6 Months', value: 120 },
  { label: '1 Year', value: 252 },
  { label: '5 Years', value: 1260 },
];
const displayOptions = [
  { label: '1 Day', value: '1d' },
  { label: '5 Days', value: '5d' },
  { label: '1 Month', value: '1m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
  { label: '5 Years', value: '5y' },
  { label: 'All', value: 'max' },
];
const predictDaysOptions = [
  { label: '1 Day', value: 1 },
  { label: '5 Days', value: 5 },
  { label: '10 Days', value: 10 },
  { label: '1 Month', value: 20 },
  { label: '3 Months', value: 60 },
  { label: '6 Months', value: 120 },
];

// Mapping for period sizes (in approximate days) to compare for auto-refetch
const periodSizes = {
  '1d': 1,
  '5d': 5,
  '1m': 30,
  '6m': 180,
  '1y': 365,
  '5y': 1825,
  'max': 9999
};

function StockPredictor() {
  const [ticker, setTicker] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayPeriod, setDisplayPeriod] = useState("1y"); // for chart only
  const [timeSteps, setTimeSteps] = useState(120); // or just hardcode
  const [predictDays, setPredictDays] = useState(20); // Changed to 20 for default "1 Month" selection

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
      const response = await axios.post(`${BACKEND_URL}/predict`, { 
      ticker,
      period: "max", // Always fetch the longest history available
      time_steps: timeSteps, 
      predict_days: predictDays 
    });
      setData(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  function filterHistorical(data, displayPeriod) {
  if (!data || !data.historical || !data.historical.dates) return data;
  const { dates, prices } = data.historical;
  let cutoffIdx = 0;

  if (displayPeriod !== 'max') {
    const lastDate = new Date(dates[dates.length - 1]);
    let startDate = new Date(lastDate);

    switch (displayPeriod) {
      case '1d': startDate.setDate(lastDate.getDate() - 1); break;
      case '5d': startDate.setDate(lastDate.getDate() - 5); break;
      case '1m': startDate.setMonth(lastDate.getMonth() - 1); break;
      case '6m': startDate.setMonth(lastDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(lastDate.getFullYear() - 1); break;
      case '5y': startDate.setFullYear(lastDate.getFullYear() - 5); break;
      default: break;
    }

    cutoffIdx = dates.findIndex(d => new Date(d) >= startDate);
    if (cutoffIdx === -1) cutoffIdx = 0;
  }

  return {
    ...data,
    historical: {
      dates: data.historical.dates.slice(cutoffIdx),
      prices: data.historical.prices.slice(cutoffIdx),
    }
  };
}

  return (
    <>
          <Helmet>
            <title>Stonks</title>
            <meta property="og:title" content="Stick Price Predictor" />
            <meta property="og:description" content="Predic the stock exchange!" />
            <meta property="og:image" content={process.env.PUBLIC_URL + "/stonks.jpg"} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="website" />
          </Helmet>
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
        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
  <div>
        <div style={{ marginBottom: "4px" }}>History Window:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {displayOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDisplayPeriod(option.value)}
              style={{
                padding: "8px",
                backgroundColor: displayPeriod === option.value ? "#007bff" : "#f0f0f0",
                color: displayPeriod === option.value ? "#fff" : "#333",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: displayPeriod === option.value ? "bold" : "normal"
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

          </div>
          <div>
            <div style={{ marginBottom: "4px" }}>Predict Days:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {predictDaysOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPredictDays(option.value)}
                  style={{
                    padding: "8px",
                    backgroundColor: predictDays === option.value ? "#007bff" : "#f0f0f0",
                    color: predictDays === option.value ? "#fff" : "#333",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: predictDays === option.value ? "bold" : "normal"
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
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
            <StockChart historical={filterHistorical(data, displayPeriod).historical} predicted={data.predicted} />
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default StockPredictor;