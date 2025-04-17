import React, {useEffect, useRef, useState} from "react";
import {Map, Popup} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"
import "./map.css"
import {getZonesForBorough, filterFeaturesByBounds} from "./Utils/DataUtils";
import {createCurvedLine, logMapBounds} from "./Utils/RenderUtils";
import {zone_layer, traffic_layer, traffic_arrows, selected_route, selected_route_arrows} from "./mapLayers/Layers";
import {map_on_load} from "./mapEvents/MapOnLoad";

export const MapLibre = ({zoneData, trafficData}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-74.0060);
    const [lat, setLat] = useState(40.7128);
    const [zoom, setZoom] = useState(10);
    const [userWindowBounds, setUserWindowBounds] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedDoBorough, setSelectedDoBorough] = useState("Manhattan"); // Default destination borough
    const [selectedPuBorough, setSelectedPuBorough] = useState("All"); // Default pickup borough is "All"
    const [selectedPuZone, setSelectedPuZone] = useState("All"); // Default specific pickup zone
    const [selectedDoZone, setSelectedDoZone] = useState("All"); // Default specific destination zone
    const [puZones, setPuZones] = useState([]); // Available pickup zones based on borough selection
    const [doZones, setDoZones] = useState([]); // Available destination zones based on borough selection

    // Process flow data to create curved lines between points
    const processFlowData = (data) => {
        if (!data || !data.features) return data;

        const processedData = {
            type: "FeatureCollection", features: []
        };

        // Filter by selected boroughs and zones
        let filteredFeatures = data.features;

        // Filter by destination borough if specific one is selected
        if (selectedDoBorough !== "All") {
            filteredFeatures = filteredFeatures.filter(feature => feature.properties.DOBorough === selectedDoBorough);

            // Further filter by destination zone if selected
            if (selectedDoZone !== "All") {
                filteredFeatures = filteredFeatures.filter(feature => feature.properties.DOZone === selectedDoZone);
            }
        }

        // Filter by pickup borough if specific one is selected
        if (selectedPuBorough !== "All") {
            filteredFeatures = filteredFeatures.filter(feature => feature.properties.PUBorough === selectedPuBorough);

            // Further filter by pickup zone if selected
            if (selectedPuZone !== "All") {
                filteredFeatures = filteredFeatures.filter(feature => feature.properties.PUZone === selectedPuZone);
            }
        }

        // Sort by destination borough, with Manhattan first when no specific borough is selected
        if (selectedDoBorough === "All") {
            filteredFeatures.sort((a, b) => {
                if (a.properties.DOBorough === "Manhattan" && b.properties.DOBorough !== "Manhattan") return -1;
                if (a.properties.DOBorough !== "Manhattan" && b.properties.DOBorough === "Manhattan") return 1;
                return 0;
            });
        }

        // Process features
        filteredFeatures.forEach(feature => {
            const startPoint = feature.geometry.coordinates[0];
            const endPoint = feature.geometry.coordinates[1];

            // Skip if start and end are the same (self-loops)
            if (startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1]) {
                return;
            }

            // Create a curved line between the points
            const curvedLine = createCurvedLine(startPoint, endPoint);

            processedData.features.push({
                ...feature, geometry: {
                    type: "LineString", coordinates: curvedLine
                }
            });
        });

        return processedData;
    };

    const updateTrafficData = (newTrafficData) => {
        if (!newTrafficData || newTrafficData.error) return;

        // Process data to create curved, filtered flows
        const processedData = processFlowData(newTrafficData);

        // Filter by map bounds
        const filteredData = filterFeaturesByBounds(processedData, userWindowBounds);

        if (map.current && map.current.getSource("traffic_source")) {
            if (filteredData != null) {
                map.current.getSource("traffic_source").setData(filteredData);
            }
        }

        // Update the selected route layer if needed
        if (selectedRoute && map.current && map.current.getSource("selected_route_source")) {
            // Find the selected route in the new data
            const findRoute = processedData.features.find(feature => feature.properties.PULocationID === selectedRoute.properties.PULocationID && feature.properties.DOLocationID === selectedRoute.properties.DOLocationID);

            if (findRoute) {
                map.current.getSource("selected_route_source").setData({
                    type: "FeatureCollection", features: [findRoute]
                });
            } else {
                // If the route is no longer in the filtered data, clear the selection
                setSelectedRoute(null);
            }
        }
    };

    // Handle destination borough selection change
    const handleDoBoroughChange = (borough) => {
        setSelectedDoBorough(borough);

        // Clear any selected route when changing boroughs
        setSelectedRoute(null);

        // Update the data to reflect the new borough selection
        updateTrafficData(trafficData);
    };

    // Handle pickup borough selection change
    const handlePuBoroughChange = (borough) => {
        setSelectedPuBorough(borough);

        // Clear any selected route when changing boroughs
        setSelectedRoute(null);

        // Update the data to reflect the new borough selection
        updateTrafficData(trafficData);
    };

    // Handle pickup zone selection change
    const handlePuZoneChange = (zone) => {
        setSelectedPuZone(zone);

        // Clear any selected route when changing zones
        setSelectedRoute(null);

        // Update the data to reflect the new zone selection
        updateTrafficData(trafficData);
    };

    // Handle destination zone selection change
    const handleDoZoneChange = (zone) => {
        setSelectedDoZone(zone);

        // Clear any selected route when changing zones
        setSelectedRoute(null);

        // Update the data to reflect the new zone selection
        updateTrafficData(trafficData);
    };


    useEffect(() => {
        if (map.current) return; // Initialize map only once
        map.current = new Map({
            container: mapContainer.current,
            style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.on("load", () => map_on_load({
                map,
                trafficData,
                zoneData,
                processFlowData,

                setUserWindowBounds,

                puZones,
                setPuZones,
                selectedPuBorough,
                handlePuBoroughChange,
                selectedPuZone,
                handlePuZoneChange,


                doZones,
                setDoZones,
                selectedDoBorough,
                handleDoBoroughChange,
                selectedDoZone,
                handleDoZoneChange,

                selectedRoute,
                setSelectedRoute
            })
        );

        return () => {
            if (map.current) {
                map.current.off("moveend", logMapBounds);
                map.current.off("zoomend", logMapBounds);
                // Remove the filter container when component unmounts
                const filterContainer = document.querySelector('.filter-container');
                if (filterContainer) {
                    // Clean up observers if they exist
                    if (filterContainer.observer) {
                        filterContainer.observer.disconnect();
                    }
                    filterContainer.remove();
                }
            }
        };
    }, []);


    // Update available zones when borough selection changes
    useEffect(() => {
        if (trafficData) {
            setPuZones(getZonesForBorough(selectedPuBorough, trafficData));
            setSelectedPuZone("All"); // Reset zone selection when borough changes
        }
    }, [selectedPuBorough, trafficData]);

    useEffect(() => {
        if (trafficData) {
            setDoZones(getZonesForBorough(selectedDoBorough, trafficData));
            setSelectedDoZone("All"); // Reset zone selection when borough changes
        }
    }, [selectedDoBorough, trafficData]);


    useEffect(() => {
        updateTrafficData(trafficData);
    }, [trafficData, userWindowBounds, selectedDoBorough, selectedPuBorough, selectedDoZone, selectedPuZone]);

    // Handle route selection/deselection
    useEffect(() => {
        if (!map.current) return;

        // If no route is selected, show all routes normally
        if (!selectedRoute) {
            // Reset opacity for traffic layers
            if (map.current.getLayer("traffic_layer")) {
                map.current.setPaintProperty("traffic_layer", "line-opacity", ["interpolate", ["linear"], ["get", "passenger_count_sum"], 1, 0.5, 10, 0.8, 100, 0.9]);

                map.current.setPaintProperty("traffic_arrows", "text-opacity", 0.8);
            }

            // Hide selected route layers
            if (map.current.getLayer("selected_route")) {
                map.current.setLayoutProperty("selected_route", "visibility", "none");
                map.current.setLayoutProperty("selected_route_arrows", "visibility", "none");
            }
            return;
        }

        // If a route is selected, reduce opacity of other routes and show the selected one
        // Make other routes semi-transparent
        map.current.setPaintProperty("traffic_layer", "line-opacity", 0.10);
        map.current.setPaintProperty("traffic_arrows", "text-opacity", 0.10);

        // Show the selected route layer
        map.current.setLayoutProperty("selected_route", "visibility", "visible");
        map.current.setLayoutProperty("selected_route_arrows", "visibility", "visible");

    }, [selectedRoute]);


    // Watch for zone list changes and update dropdown options
    useEffect(() => {
        const puZoneSelect = document.querySelector('.pu-zone-select');
        if (puZoneSelect && puZones.length > 0) {
            puZoneSelect.innerHTML = puZones.map(zone => `<option value="${zone.zone}" ${zone.zone === selectedPuZone ? 'selected' : ''}>${zone.zone}</option>`).join('');
        }
    }, [puZones, selectedPuZone]);

    useEffect(() => {
        const doZoneSelect = document.querySelector('.do-zone-select');
        if (doZoneSelect && doZones.length > 0) {
            doZoneSelect.innerHTML = doZones.map(zone => `<option value="${zone.zone}" ${zone.zone === selectedDoZone ? 'selected' : ''}>${zone.zone}</option>`).join('');
        }
    }, [doZones, selectedDoZone]);

    return (<div
        ref={mapContainer}
        style={{
            height: "100%", width: "100%", position: "relative"
        }}
    />);
};

export default MapLibre;