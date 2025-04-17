const mouse_move_on_traffic_layer = ({e, map, popup}) => {
    map.current.getCanvas().style.cursor = 'pointer';
    const coordinates = e.lngLat;
    const properties = e.features[0].properties;

    // Format properties as a table
    const formattedDescription = `
                    <div style="max-width: 300px; min-width: 250px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                        <h4 style="margin: 5px 0; font-weight: bold;">Trip Details</h4>
                        <div style="font-size: 14px; margin-bottom: 8px;">
                            <strong>From:</strong> ${properties.PUZone} (${properties.PUBorough})<br>
                            <strong>To:</strong> ${properties.DOZone} (${properties.DOBorough})
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Passengers</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">${properties.passenger_count_sum}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Avg. Distance</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">${parseFloat(properties.trip_distance).toFixed(2)} mi</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Avg. Fare</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">$${parseFloat(properties.fare_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Avg. Tip</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">$${parseFloat(properties.tip_amount).toFixed(2)}</td>
                            </tr>
                        </table>
                        <div style="font-size: 12px; text-align: center; margin-top: 8px; color: #666;">
                            Click to highlight this route
                        </div>
                    </div>
                `;

    popup
        .setLngLat(coordinates)
        .setHTML(formattedDescription)
        .addTo(map.current);
}


const mouse_move_on_selected_route_layer = ({e, map, popup}) => {
    map.current.getCanvas().style.cursor = 'pointer';
    const coordinates = e.lngLat;
    const properties = e.features[0].properties;

    // Similar popup formatting
    const formattedDescription = `
                    <div style="max-width: 300px; min-width: 250px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                        <h4 style="margin: 5px 0; font-weight: bold;">Selected Route</h4>
                        <div style="font-size: 14px; margin-bottom: 8px;">
                            <strong>From:</strong> ${properties.PUZone} (${properties.PUBorough})<br>
                            <strong>To:</strong> ${properties.DOZone} (${properties.DOBorough})
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Passengers</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">${properties.passenger_count_sum}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Avg. Distance</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">${parseFloat(properties.trip_distance).toFixed(2)} mi</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Avg. Fare</td>
                                <td style="padding: 4px; border: 1px solid #ddd;">$${parseFloat(properties.fare_amount).toFixed(2)}</td>
                            </tr>
                        </table>
                        <div style="font-size: 12px; text-align: center; margin-top: 8px; color: #666;">
                            Click anywhere else to reset
                        </div>
                    </div>
                `;

    popup
        .setLngLat(coordinates)
        .setHTML(formattedDescription)
        .addTo(map.current);
}


const click_away_from_routes = ({selectedRoute, setSelectedRoute}) => {
    // Only reset if there is a selected route
    if (selectedRoute) {
        setSelectedRoute(null);
    }
}

const click_on_traffic_layer = ({e, map, setSelectedRoute}) => {
    // Get feature properties
    const feature = e.features[0];

    // Set selected route
    setSelectedRoute(feature);

    // Update the selected route source
    map.current.getSource("selected_route_source").setData({
        type: "FeatureCollection", features: [feature]
    });

    // Stop event propagation to prevent the map click handler from firing
    e.originalEvent.stopPropagation();
}


const click_on_selected_route_layer = ({e}) => {
    e.originalEvent.stopPropagation();
}


const mouse_leave_from_traffic_layer = ({map, popup}) => {
    map.current.getCanvas().style.cursor = '';
    popup.remove();
}

const mouse_leave_from_selected_route_layer = ({map, popup}) => {
    map.current.getCanvas().style.cursor = '';
    popup.remove();
}

export {
    mouse_move_on_traffic_layer,
    mouse_move_on_selected_route_layer,
    click_away_from_routes,
    click_on_traffic_layer,
    click_on_selected_route_layer,
    mouse_leave_from_traffic_layer,
    mouse_leave_from_selected_route_layer
}