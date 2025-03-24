import React, { useState, useEffect } from "react";
import { database, ref, onValue } from "../firebaseConfig";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorData = () => {
  const [data, setData] = useState([]);
  const [range, setRange] = useState(10);

  useEffect(() => {
    const sensorRef = ref(database, "sensorData");

    onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const formattedData = Object.entries(rawData).map(([timestamp, values]) => ({
          timestamp,
          ...values,
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    });
  }, []);

  const filteredData = data.slice(Math.max(data.length - range, 0));
  const labels = filteredData.map((entry) => new Date(entry.timestamp * 1000).toLocaleString());

  const chartData = {
    labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: filteredData.map((e) => e.temperature),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Humidity (%)",
        data: filteredData.map((e) => e.humidity),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
      },
      {
        label: "Light Level (%)",
        data: filteredData.map((e) => e.light_level),
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        fill: true,
      },
      {
        label: "Soil Moisture (%)",
        data: filteredData.map((e) => e.soil_moisture),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
      // TSL2591
      {
        label: "TSL2591 Lux",
        data: filteredData.map((e) => e.tsl2591?.lux),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
      {
        label: "TSL2591 Visible",
        data: filteredData.map((e) => e.tsl2591?.visible),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        fill: false,
      },
      {
        label: "TSL2591 IR",
        data: filteredData.map((e) => e.tsl2591?.ir),
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgba(201, 203, 207, 0.2)",
        fill: false,
      },
      // AS7341 spectral channels
      {
        label: "AS7341 415nm",
        data: filteredData.map((e) => e.as7341?.["415nm"]),
        borderColor: "rgb(255, 0, 0)",
        fill: false,
      },
      {
        label: "AS7341 445nm",
        data: filteredData.map((e) => e.as7341?.["445nm"]),
        borderColor: "rgb(255, 128, 0)",
        fill: false,
      },
      {
        label: "AS7341 480nm",
        data: filteredData.map((e) => e.as7341?.["480nm"]),
        borderColor: "rgb(255, 255, 0)",
        fill: false,
      },
      {
        label: "AS7341 515nm",
        data: filteredData.map((e) => e.as7341?.["515nm"]),
        borderColor: "rgb(128, 255, 0)",
        fill: false,
      },
      {
        label: "AS7341 555nm",
        data: filteredData.map((e) => e.as7341?.["555nm"]),
        borderColor: "rgb(0, 255, 0)",
        fill: false,
      },
      {
        label: "AS7341 590nm",
        data: filteredData.map((e) => e.as7341?.["590nm"]),
        borderColor: "rgb(0, 255, 128)",
        fill: false,
      },
      {
        label: "AS7341 630nm",
        data: filteredData.map((e) => e.as7341?.["630nm"]),
        borderColor: "rgb(0, 255, 255)",
        fill: false,
      },
      {
        label: "AS7341 680nm",
        data: filteredData.map((e) => e.as7341?.["680nm"]),
        borderColor: "rgb(0, 128, 255)",
        fill: false,
      },
      {
        label: "AS7341 Clear",
        data: filteredData.map((e) => e.as7341?.["clear"]),
        borderColor: "rgb(0, 0, 255)",
        fill: false,
      },
      {
        label: "AS7341 NIR",
        data: filteredData.map((e) => e.as7341?.["nir"]),
        borderColor: "rgb(128, 0, 255)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Sensor Data Over Time",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Sensor Data</h1>

      <div className="my-4">
        <label htmlFor="range" className="block text-gray-700">
          Select the range of data to display (last X entries):
        </label>
        <input
          id="range"
          type="range"
          min="1"
          max={Math.max(data.length, 1)}
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center">{`Last ${range} entries`}</div>
      </div>

      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-center">No data available.</p>
      )}
    </div>
  );
};

export default SensorData;
