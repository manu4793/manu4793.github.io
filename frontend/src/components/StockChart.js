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
  const chartLabels = [...historical.dates, ...predicted.dates];
  const datasets = [
    {
      label: "Historical Prices",
      data: historical.prices,
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      fill: false,
      pointRadius: 3, // Add points for visibility
    },
    {
      label: "Predicted Prices",
      data: Array(historical.prices.length).fill(null).concat(predicted.prices),
      borderColor: "green",
      backgroundColor: "rgba(0, 255, 0, 0.1)",
      fill: false,
      borderDash: [5, 5], // Dashed line for predictions
      pointRadius: 3, // Add points for visibility
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow resizing without fixed aspect for mobile
    plugins: {
      title: { display: true, text: "Stock Price Chart" },
      legend: { position: "top" },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // Limit ticks to prevent clutter on mobile
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: { display: true, text: "Price (USD)" },
      },
    },
  };

  return <Line options={options} data={{ labels: chartLabels, datasets: datasets }} />;
}

export default StockChart;