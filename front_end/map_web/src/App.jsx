import React, { useEffect, useState } from "react";
import { MapLibre } from "./components/map";
import ControlPanel from "./components/controlPanel/ControlPanel";
import "./App.css";

function App() {
  const [yearMonth, setYearMonth] = useState("2024-01");
  const [zoneData, setZoneData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch taxi zone boundaries
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/taxi_zones')
      .then(resp => {
        if (!resp.ok) throw new Error('Failed to load zone data');
        return resp.json();
      })
      .then(json => {
        setZoneData(json);
        console.log(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Could not load zone data', err);
        setError('Failed to load zone boundaries');
        setLoading(false);
      });
  }, []);

  // Fetch traffic data for selected month
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/data_from_local/${yearMonth}`)
      .then(resp => {
        if (!resp.ok) throw new Error('Failed to load traffic data');
        return resp.json();
      })
      .then(json => {
        setTrafficData(json);
        console.log(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Could not load traffic data', err);
        setError(`Failed to load data for ${yearMonth}`);
        setLoading(false);
      });
  }, [yearMonth]);

  // Function to handle month selection change
  const handleMonthChange = (value) => {
    setYearMonth(value);
  };

  return (
    <div className="app-container">
      {/* Map takes up full screen */}
      <div className="map-wrapper">
        {zoneData && trafficData && 
          <MapLibre 
            zoneData={zoneData} 
            trafficData={trafficData}
          />
        }
      </div>
      
      {/* Overlays */}
      <div className="overlay-container">
        
        {/* Control panel overlay in bottome-left */}
        <div className="control-panel-overlay">
          <ControlPanel 
            year={yearMonth} 
            onChange={handleMonthChange} 
          />
        </div>
        
        {/* Loading overlay */}
        {loading && <div className="loading-overlay">Loading data...</div>}
        
        {/* Error message overlay */}
        {error && 
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        }
        
        {/* Attribution overlay in bottom-right */}
        <div className="attribution-overlay">
          Data: NYC Taxi & Limousine Commission
        </div>
      </div>
    </div>
  );
}

export default App;