const zone_layer = {
    id: "zone_layer", source: "zone_source", type: "line", paint: {
        "line-color": "#444444", "line-width": 0.6, "line-opacity": 0.7
    }
}


const traffic_layer = {
    id: "traffic_layer", source: "traffic_source", type: "line", layout: {
        "line-join": "round", "line-cap": "round"
    }, paint: {
        "line-color": ["case", // Color by borough or another property
            ["==", ["get", "DOBorough"], "Manhattan"], "#3498db", ["==", ["get", "DOBorough"], "Brooklyn"], "#2ecc71", ["==", ["get", "DOBorough"], "Queens"], "#e74c3c", ["==", ["get", "DOBorough"], "Bronx"], "#f39c12", ["==", ["get", "DOBorough"], "Staten Island"], "#9b59b6", "#95a5a6" // Default color
        ],
        "line-opacity": ["interpolate", ["linear"], ["get", "passenger_count_sum"], 1, 0.3, 10, 0.6, 100, 0.8],
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, ["+", ["*", ["get", "lineThickness"], 0.8], 1], 15, ["+", ["*", ["get", "lineThickness"], 2], 1.5]],
    }
}


const traffic_arrows = {
    id: "traffic_arrows", source: "traffic_source", type: "symbol", layout: {
        "symbol-placement": "line-center",
        "text-field": "▶",
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 12, 15, 18],
        "text-keep-upright": true,
        "symbol-spacing": 200
    }, paint: {
        "text-color": ["case", ["==", ["get", "DOBorough"], "Manhattan"], "#3498db", ["==", ["get", "DOBorough"], "Brooklyn"], "#2ecc71", ["==", ["get", "DOBorough"], "Queens"], "#e74c3c", ["==", ["get", "DOBorough"], "Bronx"], "#f39c12", ["==", ["get", "DOBorough"], "Staten Island"], "#9b59b6", "#95a5a6" // Default color
        ], "text-halo-color": "white", "text-halo-width": 1, "text-opacity": 0.8
    }
}


const selected_route = {
    id: "selected_route", source: "selected_route_source", type: "line", layout: {
        "line-join": "round", "line-cap": "round", "visibility": "none" // Hidden by default
    }, paint: {
        "line-color": "#DA70D6", // Highlight color
        "line-opacity": 0.95, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 4],
    }
}


const selected_route_arrows = {
    id: "selected_route_arrows", source: "selected_route_source", type: "symbol", layout: {
        "symbol-placement": "line",
        "text-field": "▶",
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 16, 15, 24],
        "text-keep-upright": true,
        "symbol-spacing": 100,
        "visibility": "none" // Hidden by default
    }, paint: {
        "text-color": "#e74c3c", "text-halo-color": "white", "text-halo-width": 1
    }
}

export {zone_layer, traffic_layer, traffic_arrows, selected_route, selected_route_arrows};