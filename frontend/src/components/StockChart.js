import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

function StockChart({ data, selectedIndicators, displayPeriod }) {
  const { historical, predicted, indicators } = data;

  // Collect all unique dates
  const allDatesSet = new Set([...historical.dates, ...predicted.dates]);
  const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

  // Create maps for quick lookup
  const histMap = new Map(historical.dates.map((d, i) => [d, historical.prices[i]]));
  const predMap = new Map(predicted.dates.map((d, i) => [d, predicted.prices[i]]));

  // Maps for indicators
  let rsiMap = new Map();
  let macdMap = new Map();
  let macdSignalMap = new Map();
  let macdHistMap = new Map();
  let sma50Map = new Map();
  let ema200Map = new Map();

  if (indicators) {
    if (indicators.rsi) {
      rsiMap = new Map(historical.dates.map((d, i) => [d, indicators.rsi[i]]));
    }
    if (indicators.macd) {
      macdMap = new Map(historical.dates.map((d, i) => [d, indicators.macd.macd[i]]));
      macdSignalMap = new Map(historical.dates.map((d, i) => [d, indicators.macd.signal[i]]));
      macdHistMap = new Map(historical.dates.map((d, i) => [d, indicators.macd.histogram[i]]));
    }
    if (indicators.sma50) {
      sma50Map = new Map(historical.dates.map((d, i) => [d, indicators.sma50[i]]));
    }
    if (indicators.ema200) {
      ema200Map = new Map(historical.dates.map((d, i) => [d, indicators.ema200[i]]));
    }
  }

  // Compute startDate based on displayPeriod
  let startDate = new Date();
  const lastHistoricalDate = historical.dates[historical.dates.length - 1];
  const firstHistoricalDate = historical.dates[0];
  const lastPredictedDate = predicted.dates[predicted.dates.length - 1] || lastHistoricalDate;

  const lastDateObj = new Date(lastHistoricalDate);
  startDate = new Date(lastDateObj);

  if (displayPeriod !== 'max') {
    switch (displayPeriod) {
      case '1d': startDate.setDate(lastDateObj.getDate() - 1); break;
      case '5d': startDate.setDate(lastDateObj.getDate() - 5); break;
      case '1m': startDate.setMonth(lastDateObj.getMonth() - 1); break;
      case '3m': startDate.setMonth(lastDateObj.getMonth() - 3); break;
      case '6m': startDate.setMonth(lastDateObj.getMonth() - 6); break;
      case 'ytd': startDate = new Date(lastDateObj.getFullYear(), 0, 1); break;
      case '1y': startDate.setFullYear(lastDateObj.getFullYear() - 1); break;
      case '5y': startDate.setFullYear(lastDateObj.getFullYear() - 5); break;
      default: break;
    }
  } else {
    startDate = new Date(firstHistoricalDate);
  }

  const startDateStr = startDate.toISOString().slice(0, 10);
  const minLimit = firstHistoricalDate;
  const maxLimit = lastPredictedDate;

  // Prepare datasets with {x, y}, aligned to allDates
  let datasets = [
    {
      label: "Historical Prices",
      data: allDates.map((d) => ({ x: d, y: histMap.get(d) || null })),
      borderColor: "blue",
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      fill: false,
      pointRadius: 0,
      yAxisID: 'y',
    },
    {
      label: "Predicted Prices",
      data: allDates.map((d) => ({ x: d, y: predMap.get(d) || null })),
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
        data: allDates.map((d) => ({ x: d, y: rsiMap.get(d) || null })),
        borderColor: "purple",
        yAxisID: 'y1',
        pointRadius: 0,
      });
    }
    if (selectedIndicators.includes('macd') && indicators.macd) {
      datasets.push({
        label: "MACD Line",
        data: allDates.map((d) => ({ x: d, y: macdMap.get(d) || null })),
        borderColor: "red",
        yAxisID: 'y2',
        pointRadius: 0,
      });
      datasets.push({
        label: "MACD Signal",
        data: allDates.map((d) => ({ x: d, y: macdSignalMap.get(d) || null })),
        borderColor: "orange",
        yAxisID: 'y2',
        pointRadius: 0,
      });
      datasets.push({
        type: 'bar',
        label: "MACD Histogram",
        data: allDates.map((d) => ({ x: d, y: macdHistMap.get(d) || null })),
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        yAxisID: 'y2',
      });
    }
    if (selectedIndicators.includes('sma50') && indicators.sma50) {
      datasets.push({
        label: "SMA (50)",
        data: allDates.map((d) => ({ x: d, y: sma50Map.get(d) || null })),
        borderColor: "cyan",
        yAxisID: 'y',
        pointRadius: 0,
      });
    }
    if (selectedIndicators.includes('ema200') && indicators.ema200) {
      datasets.push({
        label: "EMA (200)",
        data: allDates.map((d) => ({ x: d, y: ema200Map.get(d) || null })),
        borderColor: "magenta",
        yAxisID: 'y',
        pointRadius: 0,
      });
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: { display: true, text: "Stock Price Chart" },
      legend: { position: "top" },
      tooltip: {
        enabled: true,
        filter: (tooltipItem) => tooltipItem.parsed.y !== null,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        limits: {
          x: {
            min: minLimit,
            max: maxLimit,
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          parser: 'yyyy-MM-dd',
          displayFormats: {
            day: 'MMM d, yyyy',
            month: 'MMM yyyy',
            year: 'yyyy',
          },
          tooltipFormat: 'PP',
        },
        title: { display: true, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45,
        },
        min: startDateStr,
        max: maxLimit,
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

  return <Line options={options} data={{ datasets }} />;
}

export default StockChart;
