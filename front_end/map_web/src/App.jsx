import {MapLibre} from "./components/map";
import React, {useEffect, useRef, useState} from "react";
import ControlPanel from "./components/control-panel";

function App() {
    const [yearMonth, setYearMonth] = useState("2024-01");
    const [zoneData, setZoneData] = useState(null);
    const [trafficData, setTrafficData] = useState(null);


    useEffect(() => {
        fetch(
            'http://localhost:3000/taxi_zones'
        )
            .then(resp => resp.json())
            .then(json => setZoneData(json))
            .catch(err => console.error('Could not load data', err));
    }, []);


    useEffect(() => {
        fetch(
            'http://localhost:3000/data_from_local/' + yearMonth
        )
            .then(resp => resp.json())
            .then(json => setTrafficData(json))
            .catch(err => console.error('Could not load data', err));
    }, [yearMonth]);


    useEffect(() => {
        console.log(yearMonth);
    }, [yearMonth]);

    useEffect(() => {
        console.log(zoneData);
    }, [zoneData]);

    useEffect(() => {
        console.log(trafficData);
    }, [trafficData]);


    return (
        <>
            <ControlPanel year={yearMonth} onChange={value => setYearMonth(value)}/>

            <div>
                {zoneData && trafficData &&
                    <MapLibre zoneData={zoneData} trafficData={trafficData}/>
                }

            </div>

        </>
    );
}

export default App;
