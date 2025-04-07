import React, { useRef }  from "react";
import { Line } from "react-chartjs-2";

const SensorChart = ({ entries, options, showToggles = false }) => {
    const chartRef = useRef(null);

    const baseDatasetProps = {
        fill: false,
        tension: 0.2,
    };

    const baseDatasets = [
        {
            label: "Temperature (°C)",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.temperature })),
            yAxisID: "y",
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            ...baseDatasetProps,
        },
        {
            label: "Humidity (%)",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.humidity })),
            yAxisID: "y",
            borderColor: "rgb(153, 102, 255)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            ...baseDatasetProps,
        },
        {
            label: "Light Level",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.light })),
            yAxisID: "y3",
            borderColor: "rgb(255, 206, 86)",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
            ...baseDatasetProps,
        },
        {
            label: "Soil Moisture (%)",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.moisture })),
            yAxisID: "y",
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            ...baseDatasetProps,
        },
    ];

    const tsl2591Datasets = [
        {
            label: "TSL2591 Lux",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.lux })),
            yAxisID: "y1",
            hidden: true,
            borderColor: "rgb(255, 99, 132)",
            ...baseDatasetProps,
        },
        {
            label: "TSL2591 Visible",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.visible })),
            yAxisID: "y1",
            hidden: true,
            borderColor: "rgb(255, 159, 64)",
            ...baseDatasetProps,
        },
        {
            label: "TSL2591 IR",
            data: entries.map((e) => ({ x: new Date(e.timestamp * 1000), y: e.tsl2591?.ir })),
            yAxisID: "y1",
            hidden: true,
            borderColor: "rgb(201, 203, 207)",
            ...baseDatasetProps,
        }
    ];

    const as7341Datasets = [
        "415nm", "445nm", "480nm", "515nm", "555nm",
        "590nm", "630nm", "680nm", "clear", "nir"
    ].map((band, i) => ({
        label: `AS7341 ${band.toUpperCase()}`,
        data: entries.map((e) => ({
            x: new Date(e.timestamp * 1000),
            y: e.as7341?.[band]
        })),
        yAxisID: "y2",
        hidden: true,
        borderColor: `hsl(${i * 36}, 100%, 50%)`,
        ...baseDatasetProps,
    }));

    const chartData = {
        datasets: [
            ...baseDatasets,
            ...(showToggles ? tsl2591Datasets : []),
            ...(showToggles ? as7341Datasets : [])
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

    return (
        <div className="space-y-4">
            {showToggles && (
                <div className="flex flex-wrap gap-4 justify-center">
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
            )}

            <Line ref={chartRef} data={chartData} options={options} />
        </div>
    );
};

export default SensorChart;
