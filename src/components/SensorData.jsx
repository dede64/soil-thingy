// ...imports (unchanged)
import React, { useState, useEffect, useRef } from "react";
import "chartjs-adapter-date-fns";
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
      ctx.textBaseline = "bottom"; // so it appears above
      ctx.fillText(dataset.label, x + 6, y - 6); // shift label right and upward
      ctx.restore();
    });
  },
};

ChartJS.register(startValueLabelsPlugin);

const SensorData = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [range, setRange] = useState(0); // default: 15 minutes
  const timeRangeSeconds = {
    0: 15 * 60,
    1: 60 * 60,
    2: 24 * 60 * 60,
    3: 7 * 24 * 60 * 60
  };

  useEffect(() => {
    const sensorRef = ref(database, "sensorData");

    onValue(sensorRef, (snapshot) => {
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
  }, []);

  const nowTimestamp = Math.floor(Date.now() / 1000);
  const secondsToKeep = timeRangeSeconds[range];

  const filteredData = data.filter(
    (entry) => nowTimestamp - entry.timestamp <= secondsToKeep
  );

  const baseDatasetProps = {
    fill: false,
    tension: 0.2,
  };

  const chartData = {
    datasets: [
      {
        label: "Temperature (°C)",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.temperature })),
        yAxisID: "y",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Humidity (%)",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.humidity })),
        yAxisID: "y",
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Light Level (%)",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.light_level })),
        yAxisID: "y",
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "Soil Moisture (%)",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.soil_moisture })),
        yAxisID: "y",
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        ...baseDatasetProps,
      },
      {
        label: "TSL2591 Lux",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.lux })),
        yAxisID: "y1",
        borderColor: "rgb(255, 99, 132)",
        ...baseDatasetProps,
      },
      {
        label: "TSL2591 Visible",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.visible })),
        yAxisID: "y1",
        borderColor: "rgb(255, 159, 64)",
        ...baseDatasetProps,
      },
      {
        label: "TSL2591 IR",
        data: filteredData.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.ir })),
        yAxisID: "y1",
        borderColor: "rgb(201, 203, 207)",
        ...baseDatasetProps,
      },
      ...[
        "415nm", "445nm", "480nm", "515nm", "555nm",
        "590nm", "630nm", "680nm", "clear", "nir"
      ].map((band, i) => ({
        label: `AS7341 ${band.toUpperCase()}`,
        data: filteredData.map((e) => ({
          x: new Date(e.timestamp * 1000),
          y: e.as7341?.[band]
        })),
        yAxisID: "y2",
        borderColor: `hsl(${i * 36}, 100%, 50%)`,
        ...baseDatasetProps,
      })),
    ]
  };

  const toggleGroup = (groupName) => {
    const chart = chartRef.current;
    if (!chart) return;

    const groups = {
      tsl2591: [
        "TSL2591 LUX", "TSL2591 VISIBLE", "TSL2591 IR"
      ],
      as7341: [
        "AS7341 415NM", "AS7341 445NM", "AS7341 480NM", "AS7341 515NM",
        "AS7341 555NM", "AS7341 590NM", "AS7341 630NM", "AS7341 680NM",
        "AS7341 CLEAR", "AS7341 NIR"
      ]
    };

    const targetLabels = groups[groupName];

    chart.data.datasets.forEach((dataset, index) => {
      if (targetLabels.includes(dataset.label.toUpperCase())) {
        const meta = chart.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? true : !meta.hidden;
      }
    });

    chart.update();
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
    },
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col px-4 py-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight text-center">
        🌱 Soil thingy
      </h1>
  
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <button
          onClick={() => toggleGroup("tsl2591")}
          className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
        >
          Toggle TSL2591
        </button>
        <button
          onClick={() => toggleGroup("as7341")}
          className="px-4 py-2 rounded-md bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition"
        >
          Toggle AS7341
        </button>
      </div>
  
      <div className="w-full max-w-4xl mx-auto my-6 p-6 rounded-xl border bg-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="range" className="text-gray-700 font-semibold text-lg">
            ⏱️ Time Range
          </label>
          <span className="text-sm text-gray-600">
            {{"0": " 15 minutes", "1": " 1 hour", "2": " 1 day", "3": " 1 week"}[range]}
          </span>
        </div>
  
        <input
          id="range"
          type="range"
          min="0"
          max="3"
          step="1"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>
  
      <div className="flex-grow min-h-[400px] w-full max-w-7xl mx-auto px-2">
        {filteredData.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <p className="text-center">No data available.</p>
        )}
      </div>
    </div>
  );
  
};

export default SensorData;
