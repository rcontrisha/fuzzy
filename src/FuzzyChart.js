import React from "react";
import { Line } from "react-chartjs-2";

const FuzzyChart = ({ title, lowData, midData, highData, labels, chartData }) => {
  const chartDataConfig = chartData || {
    labels, // Label untuk sumbu X (range nilai tertentu)
    datasets: [
      {
        label: "Rendah",
        data: lowData, // Data untuk fungsi rendah
        borderColor: "red",
        backgroundColor: "transparent",
        pointRadius: 0,
      },
      {
        label: "Sedang",
        data: midData, // Data untuk fungsi sedang
        borderColor: "green",
        backgroundColor: "transparent",
        pointRadius: 0,
      },
      {
        label: "Tinggi",
        data: highData, // Data untuk fungsi tinggi
        borderColor: "blue",
        backgroundColor: "transparent",
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Nilai",
        },
      },
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: "Keanggotaan",
        },
      },
    },
  };

  return (
    <div className="mb-6">
      <Line data={chartDataConfig} options={options} />
    </div>
  );
};

export default FuzzyChart;
