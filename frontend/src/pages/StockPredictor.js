import React, { useState } from "react";
import axios from "axios";
import StockChart from "../components/StockChart.js";
import { Helmet } from "react-helmet";
import './StockPredictor.css';

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

const timeRangeOptions = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'MAX', value: 'max' },
];

const modelOptions = [
  { label: 'Last day', value: 1 },
  { label: 'Last 5 days', value: 5 },
  { label: 'Last 10 days', value: 10 },
  { label: 'Last month', value: 20 },
  { label: 'Last 3 months', value: 60 },
  { label: 'Last 6 months', value: 120 },
];

const predictDaysOptions = [
  { label: '1 Day', value: 1 },
  { label: '5 Days', value: 5 },
  { label: '10 Days', value: 10 },
  { label: '1 Month', value: 20 },
  { label: '3 Months', value: 60 },
  { label: '6 Months', value: 120 },
];

const indicatorOptions = [
  { label: 'RSI (14)', value: 'rsi' },
  { label: 'MACD', value: 'macd' },
  { label: 'SMA (50)', value: 'sma50' },
  { label: 'EMA (200)', value: 'ema200' },
];

// Debounce utility function (outside the component)
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function StockPredictor() {
  const [ticker, setTicker] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayPeriod, setDisplayPeriod] = useState("1y");
  const [selectedModel, setSelectedModel] = useState(20);
  const [predictDays, setPredictDays] = useState(20);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const fetchSuggestions = debounce(async (value) => {
    if (!value) {
      setSuggestions(popularStocks);
      return;
    }
    if (value.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/search_ticker?query=${value.toUpperCase()}`);
      const results = response.data.results || [];
      let mappedSuggestions = results.map((item) => ({
        ticker: item.ticker,
        name: item.name,
      }));
      if (value.length === 1) {
        const upperValue = value.toUpperCase();
        const filtered = popularStocks.filter(
          (stock) =>
            stock.ticker.toUpperCase().startsWith(upperValue) ||
            stock.name.toUpperCase().startsWith(upperValue)
        );
        const uniqueFiltered = filtered.filter(
          (stock) => !mappedSuggestions.some((s) => s.ticker === stock.ticker)
        );
        mappedSuggestions = [...mappedSuggestions, ...uniqueFiltered];
      }
      setSuggestions(mappedSuggestions);
    } catch (err) {
      // Fallback to local popularStocks filtering
      const filtered = popularStocks.filter(
        (stock) =>
          stock.ticker.toUpperCase().startsWith(value.toUpperCase()) ||
          stock.name.toUpperCase().startsWith(value.toUpperCase())
      );
      setSuggestions(filtered);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    fetchSuggestions(value);
  };

  const handleFocus = () => {
    fetchSuggestions(ticker);
  };

  const handleBlur = () => {
    setTimeout(() => setSuggestions([]), 200);
  };

  const handleSelectSuggestion = (selectedTicker) => {
    setTicker(selectedTicker);
    setSuggestions([]);
  };

  const handleIndicatorChange = (indicator) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSuggestions([]);
    try {
      const response = await axios.post(`${BACKEND_URL}/predict`, {
        ticker,
        period: "max",
        time_steps: selectedModel,
        predict_days: predictDays,
      });
      const resData = response.data;
      setData(resData);
      if (resData.error) {
        setError(resData.error);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Stonks</title>
        <meta property="og:title" content="Stock Price Predictor" />
        <meta property="og:description" content="Predict the stock exchange!" />
        <meta property="og:image" content={process.env.PUBLIC_URL + "/stonks.jpg"} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh" }}>
        <div
          className="stock-card"
          style={{
            maxWidth: window.innerWidth < 600 ? "98vw" : "50%",
            width: window.innerWidth < 600 ? "98vw" : "100%",
            padding: window.innerWidth < 600 ? "10px" : "20px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginTop: "40px"
          }}
        >
          <h1 style={{ marginBottom: "20px" }}>Stock Price Predictor</h1>
          <form className="stock-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <input
              type="text"
              value={ticker}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search ticker (e.g., NVDA)"
              required
              style={{ width: "100%", maxWidth: "600px", padding: "10px", marginBottom: "20px", fontSize: "16px" }}
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
                  maxWidth: "600px",
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
            {/* Predict options row, centered */}
            <div className="predict-options-row">
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Predict based on:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(parseInt(e.target.value))}
                  style={{ padding: "8px", width: "200px" }}
                >
                  {modelOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Predict the next:</label>
                <select
                  value={predictDays}
                  onChange={(e) => setPredictDays(parseInt(e.target.value))}
                  style={{ padding: "8px", width: "200px" }}
                >
                  {predictDaysOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "20px", cursor: "pointer" }}>Predict</button>
          </form>
          {loading && <p style={{ marginTop: "20px" }}>Loading...</p>}
          {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
          {data && (
            <>
              <div className="indicator-row" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", marginBottom: "10px" }}>
                <label>Indicators:</label>
                {indicatorOptions.map(option => (
                  <label key={option.value} style={{ marginRight: "10px" }}>
                    <input
                      type="checkbox"
                      checked={selectedIndicators.includes(option.value)}
                      onChange={() => handleIndicatorChange(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="time-range-row" style={{ display: "flex", justifyContent: "center", marginTop: "20px", marginBottom: "10px" }}>
                {timeRangeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDisplayPeriod(option.value)}
                    style={{
                      padding: "8px 12px",
                      margin: "0 2px",
                      backgroundColor: displayPeriod === option.value ? "#007bff" : "#f0f0f0",
                      color: displayPeriod === option.value ? "#fff" : "#333",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  padding: "10px",
                  marginTop: "20px",
                  height: "500px"
                }}
              >
                <StockChart data={data} displayPeriod={displayPeriod} selectedIndicators={selectedIndicators} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default StockPredictor;
