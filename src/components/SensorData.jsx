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
  const baseDatasetProps = {
    fill: false,
    tension: 0.2,
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: filteredData.map((e) => e.temperature),
        yAxisID: "y",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Humidity (%)",
        data: filteredData.map((e) => e.humidity),
        yAxisID: "y",
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Light Level (%)",
        data: filteredData.map((e) => e.light_level),
        yAxisID: "y",
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Soil Moisture (%)",
        data: filteredData.map((e) => e.soil_moisture),
        yAxisID: "y",
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        ...baseDatasetProps,
      },
      // TSL2591
      {
        label: "TSL2591 Lux",
        data: filteredData.map((e) => e.tsl2591?.lux),
        yAxisID: "y1",
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "TSL2591 Visible",
        data: filteredData.map((e) => e.tsl2591?.visible),
        yAxisID: "y1",
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "TSL2591 IR",
        data: filteredData.map((e) => e.tsl2591?.ir),
        yAxisID: "y1",
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgba(201, 203, 207, 0.2)",
        ...baseDatasetProps,
      },
      // AS7341 spectral channels
      {
        label: "AS7341 415nm",
        data: filteredData.map((e) => e.as7341?.["415nm"]),
        yAxisID: "y2",
        borderColor: "rgb(255, 0, 0)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 445nm",
        data: filteredData.map((e) => e.as7341?.["445nm"]),
        yAxisID: "y2",
        borderColor: "rgb(255, 128, 0)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 480nm",
        data: filteredData.map((e) => e.as7341?.["480nm"]),
        yAxisID: "y2",
        borderColor: "rgb(255, 255, 0)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 515nm",
        data: filteredData.map((e) => e.as7341?.["515nm"]),
        yAxisID: "y2",
        borderColor: "rgb(128, 255, 0)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 555nm",
        data: filteredData.map((e) => e.as7341?.["555nm"]),
        yAxisID: "y2",
        borderColor: "rgb(0, 255, 0)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 590nm",
        data: filteredData.map((e) => e.as7341?.["590nm"]),
        yAxisID: "y2",
        borderColor: "rgb(0, 255, 128)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 630nm",
        data: filteredData.map((e) => e.as7341?.["630nm"]),
        yAxisID: "y2",
        borderColor: "rgb(0, 255, 255)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 680nm",
        data: filteredData.map((e) => e.as7341?.["680nm"]),
        yAxisID: "y2",
        borderColor: "rgb(0, 128, 255)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 Clear",
        data: filteredData.map((e) => e.as7341?.["clear"]),
        yAxisID: "y2",
        borderColor: "rgb(0, 0, 255)",
        ...baseDatasetProps,
      },
      {
        label: "AS7341 NIR",
        data: filteredData.map((e) => e.as7341?.["nir"]),
        yAxisID: "y2",
        borderColor: "rgb(128, 0, 255)",
        ...baseDatasetProps,
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
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Temperature / Humidity / Soil / Light Level",
        },
      },
      y1: {
        beginAtZero: true,
        type: "linear",
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Lux / TSL2591",
        },
      },
      y2: {
        beginAtZero: true,
        type: "linear",
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "AS7341 Spectral Values",
        },
      },
    }    
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
