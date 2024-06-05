// ElectionResultsChart.js
"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = ({ data }) => {
  const chartData = {
    labels: data.map((result) => result.candidate),
    datasets: [
      {
        label: "Seats Won",
        data: data.map((result) => result.votes),
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  };

  // Dynamic Color Generation
  const backgroundColor = data.map((_, index) => {
    const hue = index * 137.5; // Generating distinct hues
    return `hsl(${hue}, 60%, 50%)`;
  });

  const borderColor = backgroundColor.map((color) =>
    color.replace("50%", "30%")
  );

  chartData.datasets[0].backgroundColor = backgroundColor;
  chartData.datasets[0].borderColor = borderColor;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Election Results 2024",
        font: {
          size: 20,
          weight: "bold",
        },
        color: "#333",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString()} seats`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  return <Doughnut data={chartData} options={options} className="mb-4" />;
};

export default Charts;
