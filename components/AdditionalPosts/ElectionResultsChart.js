"use client";
import React, { useRef, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const Charts = ({ data }) => {
  const chartRef = useRef(null);
  const [isChartVisible, setIsChartVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsChartVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

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
    scales: {
      x: {
        title: {
          display: true,
          text: "Parties",
        },
      },
      y: {
        title: {
          display: true,
          text: "Seats Won",
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  return (
    <div ref={chartRef} className="mb-4">
      {isChartVisible && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default Charts;
