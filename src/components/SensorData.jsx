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
        setData([]); // No data found
      }
    });
  }, []);

  // Filter the data based on the selected range
  const filteredData = data.slice(Math.max(data.length - range, 0));

  // Prepare data for the chart
  const chartData = {
    labels: filteredData.map((entry) => new Date(entry.timestamp * 1000).toLocaleString()), // Timestamps on the x-axis
    datasets: [
      {
        label: "Temperature (°C)",
        data: filteredData.map((entry) => entry.temperature), // Temperature data for the y-axis
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Humidity (%)",
        data: filteredData.map((entry) => entry.humidity), // Humidity data for the y-axis
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
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
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Sensor Data</h1>
      
      {/* Slider to select the range of data to display */}
      <div className="my-4">
        <label htmlFor="range" className="block text-gray-700">
          Select the range of data to display (last X entries):
        </label>
        <input
          id="range"
          type="range"
          min="1"
          max={data.length}
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
