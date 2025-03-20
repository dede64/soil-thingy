import React from "react";
import SensorData from "./components/SensorData";
import "./index.css"; // Ensure Tailwind styles are included

function App() {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <SensorData />
        </div>
    );
}

export default App;