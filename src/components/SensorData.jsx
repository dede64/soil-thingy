import React, { useState, useEffect, useRef } from "react";
import "chartjs-adapter-date-fns";
import { database, ref, onValue } from "../firebaseConfig";
import SensorChart from "./SensorChart";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const startValueLabelsPlugin = {
  id: 'startValueLabels',
  afterDatasetsDraw(chart, args, pluginOptions) {
    if (!pluginOptions.display) return;

    const { ctx } = chart;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden || !meta.data.length) return;

      const firstPoint = meta.data.find(point => point !== null);
      if (!firstPoint) return;

      const x = firstPoint.x;
      const y = firstPoint.y;

      ctx.save();
      ctx.font = "12px sans-serif";
      ctx.fillStyle = dataset.borderColor;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(dataset.label, x + 6, y - 6);
      ctx.restore();
    });
  },
};

ChartJS.register(startValueLabelsPlugin);

const SensorData = () => {
  const [data, setData] = useState([]);
  const [sensorIds, setSensorIds] = useState([]);
  const [selectedSensorId, setSelectedSensorId] = useState(() => {
    return localStorage.getItem("selectedSensorId") || null;
  });
  const [hasAutoSelectedSensor, setHasAutoSelectedSensor] = useState(false);
  const [range, setRange] = useState(0);

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
        const ids = Object.keys(snapshot.val());
        setSensorIds(ids);
  
        if (!hasAutoSelectedSensor) {
          const storedSensorId = localStorage.getItem("selectedSensorId");
          const fallbackSensorId = storedSensorId && ids.includes(storedSensorId)
            ? storedSensorId
            : ids[0];
  
          setSelectedSensorId(fallbackSensorId);
          setHasAutoSelectedSensor(true);
        }
      }
    });
  }, [hasAutoSelectedSensor]);

  useEffect(() => {
    if (selectedSensorId) {
      localStorage.setItem("selectedSensorId", selectedSensorId);
    }
  }, [selectedSensorId]);

  useEffect(() => {
    if (!selectedSensorId) return;

    const sensorRef = ref(database, `sensors/${selectedSensorId}`);
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const formattedData = Object.entries(rawData).map(([timestamp, values]) => ({
          timestamp: Number(timestamp),
          ...values,
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, [selectedSensorId]);

  const nowTimestamp = Math.floor(Date.now() / 1000);
  const secondsToKeep = timeRangeSeconds[range];

  const filteredData = data.filter(
    (entry) => nowTimestamp - entry.timestamp <= secondsToKeep
  );

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
          text: "Temperature / Humidity / Soil",
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
    <div className="w-full min-h-screen bg-gray-100 flex flex-col px-4 py-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight text-center">
        🌱 Soil thingy
      </h1>

      <div className="flex justify-center items-center gap-4 mb-6">
        <label htmlFor="sensorSelect" className="text-lg font-medium text-gray-700">
          Sensor:
        </label>
        <select
          id="sensorSelect"
          value={selectedSensorId}
          onChange={(e) => setSelectedSensorId(e.target.value)}
          className="px-10 py-8 rounded-md bg-white border border-gray-300 shadow font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sensorIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-2xl w-full mx-auto my-4 px-4">
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

      <div className="flex-grow min-h-[400px] w-full max-w-7xl mx-auto px-2">
        {filteredData.length > 0 ? (
          <SensorChart entries={filteredData} options={options} showToggles />
        ) : (
          <p className="text-center">No data available.</p>
        )}
      </div>
    </div>
  );
};

export default SensorData;
