import {logMapBounds} from "../Utils/RenderUtils";
import {getZonesForBorough} from "../Utils/DataUtils";
import {selected_route, selected_route_arrows, traffic_arrows, traffic_layer, zone_layer} from "../mapLayers/Layers";
import {FilterPanel} from "../filterPanel/FilterPanel";
import {Popup} from "maplibre-gl";
import {
    click_away_from_routes, click_on_selected_route_layer,
    click_on_traffic_layer, mouse_leave_from_selected_route_layer, mouse_leave_from_traffic_layer,
    mouse_move_on_selected_route_layer,
    mouse_move_on_traffic_layer
} from "./MapEvents";

const map_on_load = ({
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
                     }) => {
    logMapBounds({map, setUserWindowBounds});
    // Process and add the traffic flow data
    const processedData = processFlowData(trafficData);

    // Initialize the zone lists
    setPuZones(getZonesForBorough(selectedPuBorough, trafficData));
    setDoZones(getZonesForBorough(selectedDoBorough, trafficData));

    map.current.addSource("zone_source", {
        type: "geojson", data: zoneData,
    });

    map.current.addSource("traffic_source", {
        type: "geojson", data: processedData,
    });

    // Add source and layers for selected route
    map.current.addSource("selected_route_source", {
        type: "geojson", data: {
            type: "FeatureCollection", features: []
        }
    });

    map.current.addLayer(zone_layer);

    // Flow arrows layer
    map.current.addLayer(traffic_layer);

    // Optional: Add arrow heads at the end of lines
    map.current.addLayer(traffic_arrows);

    // Selected route layer
    map.current.addLayer(selected_route);

    // Selected route arrows
    map.current.addLayer(selected_route_arrows);

    const filterContainer = FilterPanel({
        map,
        handlePuBoroughChange,
        handleDoBoroughChange,
        selectedPuZone,
        selectedDoZone,
        handlePuZoneChange,
        handleDoZoneChange,
        puZones,
        doZones,
    });

    // Add filter to the map
    map.current.getContainer().appendChild(filterContainer);

    // Popup for flow information
    const popup = new Popup({
        closeButton: false, closeOnClick: false,
    });

    // Hover effect on routes
    map.current.on('mousemove', 'traffic_layer', (e) =>
        mouse_move_on_traffic_layer({e, map, popup})
    );

    // Similarly for selected route hover
    map.current.on('mousemove', 'selected_route', (e) =>
        mouse_move_on_selected_route_layer({e, map, popup})
    );

    // Map click handler to clear selection when clicking away from routes
    map.current.on('click', (e) =>
        click_away_from_routes({e, map, selectedRoute, setSelectedRoute})
    );

    // Click to select a route
    map.current.on('click', 'traffic_layer', (e) =>
        click_on_traffic_layer({e, map, setSelectedRoute})
    );


    // To prevent clearing selection when clicking on the selected route
    map.current.on('click', 'selected_route', (e) =>
        click_on_selected_route_layer({e})
    );

    // Change cursor back and remove popup when not hovering
    map.current.on('mouseleave', 'traffic_layer', () =>
        mouse_leave_from_traffic_layer({map, popup})
    );

    map.current.on('mouseleave', 'selected_route', () =>
        mouse_leave_from_selected_route_layer({map, popup})
    );

    // Listen for user interactions (zoom/move)
    map.current.on("moveend", logMapBounds);
    map.current.on("zoomend", logMapBounds);
}


export {map_on_load};