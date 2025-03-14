import React, {useEffect, useRef, useState} from "react";
import {Map, Popup} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css"
import "./map.css"

export const MapLibre = ({zoneData, trafficData}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-74.0060);
    const [lat, setLat] = useState(40.7128);
    const [zoom, setZoom] = useState(10);
    const [userWindowBounds, setUserWindowBounds] = useState(null);


    const filterFeaturesByBounds = (featureCollection, userWindowBounds) => {
        if (!userWindowBounds) return featureCollection;
        const {topLeft, bottomRight} = userWindowBounds;

        const isWithinBounds = (lng, lat) => {
            const lngMargin = (bottomRight.lng - topLeft.lng) * 0.05;
            const latMargin = (topLeft.lat - bottomRight.lat) * 0.05;

            const adjustedTopLeft = {
                lng: topLeft.lng + lngMargin,
                lat: topLeft.lat - latMargin
            };

            const adjustedBottomRight = {
                lng: bottomRight.lng - lngMargin,
                lat: bottomRight.lat + latMargin
            };

            return (
                lng >= adjustedTopLeft.lng && lng <= adjustedBottomRight.lng &&
                lat >= adjustedBottomRight.lat && lat <= adjustedTopLeft.lat
            );
        };


        const filteredFeatures = featureCollection.features.filter(feature => {
            if (!feature.geometry || !feature.geometry.coordinates) return false;

            return feature.geometry.coordinates.every(coord =>
                isWithinBounds(coord[0], coord[1])
            );
        });

        const sortedFeatures = filteredFeatures.sort((a, b) =>
            b.properties.lineThickness - a.properties.lineThickness
        );

        return {
            type: "FeatureCollection",
            features: sortedFeatures.slice(0, 500)
        };
    };


    const updateTrafficData = (newTrafficData) => {
        if (!newTrafficData || newTrafficData.error) return;

        const filteredTrafficData = filterFeaturesByBounds(newTrafficData, userWindowBounds);
        if (map.current && map.current.getSource("traffic_source")) {
            if (filteredTrafficData != null) {
                map.current.getSource("traffic_source").setData(filteredTrafficData);
            }
        }
    };

    useEffect(() => {
        updateTrafficData(trafficData);
        console.log("changes", userWindowBounds);
    }, [trafficData, userWindowBounds]);


    useEffect(() => {
        if (map.current) return; // Initialize map only once
        map.current = new Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    "raster-tiles": {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        minzoom: 0,
                        maxzoom: 19,
                    },
                },
                glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
                layers: [
                    {
                        id: "simple-tiles",
                        type: "raster",
                        source: "raster-tiles",
                        minzoom: 0,
                        maxzoom: 19,
                    },
                ],
            },
            center: [lng, lat],
            zoom: zoom,
        });

        // Function to log map bounds
        const logMapBounds = () => {
            if (!map.current) return;
            const bounds = map.current.getBounds();
            const topLeft = {lng: bounds.getWest(), lat: bounds.getNorth()};
            const topRight = {lng: bounds.getEast(), lat: bounds.getNorth()};
            const bottomLeft = {lng: bounds.getWest(), lat: bounds.getSouth()};
            const bottomRight = {lng: bounds.getEast(), lat: bounds.getSouth()};
            setUserWindowBounds({
                "topLeft": topLeft,
                "topRight": topRight,
                "bottomLeft": bottomLeft,
                "bottomRight": bottomRight
            })
        };

        map.current.on("load", () => {
            logMapBounds(); // Log once when map loads

            // Add zone layer
            map.current.addSource("zone_source", {
                type: "geojson",
                data: zoneData,
            });
            map.current.addLayer({
                id: "zone_layer",
                source: "zone_source",
                type: "fill",
                paint: {
                    "fill-color": ["get", "color"],
                    "fill-opacity": 0.6,
                },
            });

            map.current.addSource("traffic_source", {
                type: "geojson",
                data: trafficData,
            });
            map.current.addLayer({
                id: "traffic_layer",
                source: "traffic_source",
                type: "line",
                paint: {
                    "line-color": "black",
                    "line-opacity": 0.6,
                    "line-width": ["+", ["get", "lineThickness"], 0.5],
                },
            });


            const popup = new Popup({
                closeButton: false,
                closeOnClick: false,


            });


            map.current.on('mousemove', 'traffic_layer', (e) => {
                map.current.getCanvas().style.cursor = 'pointer';
                const coordinates = e.features[0].geometry.coordinates.slice()[0];
                const properties = e.features[0].properties;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Format properties as a table
                const formattedDescription = `
                    <div style="max-width: 300px; min-width: 300px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                        <h4 style="margin: 5px 0; font-weight: bold;">Trip Details</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${Object.entries(properties).map(([key, value]) => `
                                <tr>
                                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">${key}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd;">${value}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                `;


                popup
                    .setLngLat(e.lngLat)
                    .setHTML(formattedDescription)
                    .addTo(map.current);
            });


            // Change it back to a pointer when it leaves.
            map.current.on('mouseleave', 'traffic_layer', () => {
                map.current.getCanvas().style.cursor = '';
                popup.remove();
            });

            // Listen for user interactions (zoom/move)
            map.current.on("moveend", logMapBounds);
            map.current.on("zoomend", logMapBounds);
        });

        return () => {
            if (map.current) {
                map.current.off("moveend", logMapBounds);
                map.current.off("zoomend", logMapBounds);
            }
        };
    }, []);

    return (
        <div>
            <div
                ref={mapContainer}
                style={{
                    height: "90vh",
                    width: "100vw",
                }}
            />
        </div>
    );
};

export default {MapLibre};
