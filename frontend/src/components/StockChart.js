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
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StockChart({ data, selectedIndicators }) {
  const { historical, predicted, indicators } = data;
  const chartLabels = [...historical.dates, ...predicted.dates];

  let datasets = [
    {
      label: "Historical Prices",
      data: [...historical.prices, ...Array(predicted.prices.length).fill(null)],
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      fill: false,
      pointRadius: 0,
      yAxisID: 'y',
    },
    {
      label: "Predicted Prices",
      data: Array(historical.prices.length).fill(null).concat(predicted.prices),
      borderColor: "green",
      backgroundColor: "rgba(0, 255, 0, 0.1)",
      fill: false,
      borderDash: [5, 5],
      pointRadius: 0,
      yAxisID: 'y',
    },
  ];

  // Add indicators based on selected
  if (indicators) {
    if (selectedIndicators.includes('rsi') && indicators.rsi) {
      datasets.push({
        label: "RSI (14)",
        data: [...indicators.rsi, ...Array(predicted.prices.length).fill(null)],
        borderColor: "purple",
        yAxisID: 'y1',
        pointRadius: 0,
      });
    }
    if (selectedIndicators.includes('macd') && indicators.macd) {
      datasets.push({
        label: "MACD Line",
        data: [...indicators.macd.macd, ...Array(predicted.prices.length).fill(null)],
        borderColor: "red",
        yAxisID: 'y2',
        pointRadius: 0,
      });
      datasets.push({
        label: "MACD Signal",
        data: [...indicators.macd.signal, ...Array(predicted.prices.length).fill(null)],
        borderColor: "orange",
        yAxisID: 'y2',
        pointRadius: 0,
      });
      datasets.push({
        type: 'bar',
        label: "MACD Histogram",
        data: [...indicators.macd.histogram, ...Array(predicted.prices.length).fill(null)],
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        yAxisID: 'y2',
      });
    }
    if (selectedIndicators.includes('sma50') && indicators.sma50) {
      datasets.push({
        label: "SMA (50)",
        data: [...indicators.sma50, ...Array(predicted.prices.length).fill(null)],
        borderColor: "cyan",
        yAxisID: 'y',
        pointRadius: 0,
      });
    }
    if (selectedIndicators.includes('ema200') && indicators.ema200) {
      datasets.push({
        label: "EMA (200)",
        data: [...indicators.ema200, ...Array(predicted.prices.length).fill(null)],
        borderColor: "magenta",
        yAxisID: 'y',
        pointRadius: 0,
      });
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: "Stock Price Chart" },
      legend: { position: "top" },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: "Price (USD)" },
      },
      y1: {
        type: 'linear',
        display: selectedIndicators.includes('rsi'),
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: "RSI" },
        min: 0,
        max: 100,
      },
      y2: {
        type: 'linear',
        display: selectedIndicators.includes('macd'),
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: "MACD" },
      },
    },
  };

  return <Line options={options} data={{ labels: chartLabels, datasets }} />;
}

export default StockChart;