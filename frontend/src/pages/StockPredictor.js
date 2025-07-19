import React, { useState } from "react";
import axios from "axios";  // Or use fetch if not installed
import StockChart from "../components/StockChart.js";

const BACKEND_URL = "https://manu4793-github-io.onrender.com";  // Replace with your actual Render URL

function StockPredictor() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

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
    <div style={{ padding: "20px" }}>
      <h1>Stock Price Predictor</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter stock ticker (e.g., AAPL)"
          required
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Predict</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <StockChart
          historical={data.historical}
          predicted={data.predicted}
        />
      )}
    </div>
  );
}

export default StockPredictor;