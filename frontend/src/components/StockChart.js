import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StockChart({ historical, predicted }) {
  const chartData = [...historical.dates, ...predicted.dates];
  const datasets = [
    {
      label: "Historical Prices",
      data: historical.prices,
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      fill: false,
    },
    {
      label: "Predicted Prices",
      data: Array(historical.prices.length).fill(null).concat(predicted.prices),
      borderColor: "green",
      backgroundColor: "rgba(0, 255,0, 0.1)",
      fill: false,
      borderDash: [5, 5],  // Dashed line for predictions
    },
  ];

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Stock Price Chart" },
      legend: { position: "top" },
    },
    scales: {
      x: { title: { display: "Date" } },
      y: { title: { display: true, text: "Price (USD)" } },
    },
  };

  return <Line options={options} data={{ labels: chartData, datasets: datasets }} />;
}

export default StockChart;