import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "../firebaseConfig";
import SensorChart from "./SensorChart";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const AllSensorsOverview = () => {
  const [sensorData, setSensorData] = useState({});
  const [range, setRange] = useState(1);

  const timeRangeSeconds = {
    0: 15 * 60,
    1: 60 * 60,
    2: 4 * 60 * 60,
    3: 12 * 60 * 60,
    4: 24 * 60 * 60,
    5: 7 * 24 * 60 * 60
  };

  useEffect(() => {
    const sensorsRef = ref(database, "sensors");
    onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawSensors = snapshot.val();
        const parsed = {};
        const now = Math.floor(Date.now() / 1000);
        const cutoff = timeRangeSeconds[range];

        Object.entries(rawSensors).forEach(([sensorId, sensorEntries]) => {
          const formatted = Object.entries(sensorEntries).map(([timestamp, values]) => ({
            timestamp: Number(timestamp),
            ...values,
          }));
          parsed[sensorId] = formatted.filter(entry => now - entry.timestamp <= cutoff);
        });

        setSensorData(parsed);
      }
    });
  }, [range]);

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
      startValueLabels: {
        display: true,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "PPpp",
        },
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        beginAtZero: true,
        position: "left",
        title: {
          display: true,
          text: "Temperature / Humidity / Soil / Light Level",
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "TSL2591",
        },
      },
      y2: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "AS7341",
        },
      },
      y3: {
        beginAtZero: true,
        position: "left",
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "Light",
        },
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 space-y-8">
      <h2 className="text-3xl font-bold text-center">📊 Sensor Overview</h2>

      <div className="max-w-lg mx-auto my-4">
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1 px-1">
          <span>15m</span><span>1h</span><span>4h</span><span>12h</span><span>1d</span><span>1w</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(sensorData).map(([sensorId, entries]) => (
            <div key={sensorId} className="p-4 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2 text-center">Sensor: {sensorId}</h3>
            {entries.length > 0 ? (
                <SensorChart entries={entries} options={options} />
            ) : (
                <p className="text-sm text-gray-500 text-center">No data for this sensor.</p>
            )}
            </div>
        ))}
        </div>
    </div>
  );
};

export default AllSensorsOverview;
