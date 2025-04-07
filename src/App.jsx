import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SensorData from "./components/SensorData";
import AllSensorsOverview from "./components/AllSensorsOverview"; // You'll create this component
import "./index.css"; // Tailwind styles

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Navigation */}
                <nav className="bg-white shadow p-4 flex justify-center gap-6 text-blue-600 font-semibold">
                    <Link to="/" className="hover:underline">📟 Single Sensor</Link>
                    <Link to="/overview" className="hover:underline">📈 Overview</Link>
                </nav>

                {/* Page Content */}
                <main className="flex-grow flex justify-center items-start p-6">
                    <Routes>
                        <Route path="/" element={<SensorData />} />
                        <Route path="/overview" element={<AllSensorsOverview />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
