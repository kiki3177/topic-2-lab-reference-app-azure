// Find all available zones for a borough
const getZonesForBorough = (borough, data) => {
    if (!data || !data.features) return [];

    // If all boroughs, return special "All" option only
    if (borough === "All") {
        return [{ zone: "All", locationID: "All" }];
    }

    // Get unique zones for the selected borough
    const uniqueZones = new Set();
    const zoneObjects = [];

    data.features.forEach(feature => {
        if (feature.properties.PUBorough === borough && !uniqueZones.has(feature.properties.PUZone)) {
            uniqueZones.add(feature.properties.PUZone);
            zoneObjects.push({
                zone: feature.properties.PUZone,
                locationID: feature.properties.PULocationID
            });
        }

        if (feature.properties.DOBorough === borough && !uniqueZones.has(feature.properties.DOZone)) {
            uniqueZones.add(feature.properties.DOZone);
            zoneObjects.push({
                zone: feature.properties.DOZone,
                locationID: feature.properties.DOLocationID
            });
        }
    });

    // Sort zones alphabetically
    return [{ zone: "All", locationID: "All" }].concat(
        zoneObjects.sort((a, b) => a.zone.localeCompare(b.zone))
    );
};


const filterFeaturesByBounds = (featureCollection, userWindowBounds) => {
    if (!userWindowBounds || !featureCollection) return featureCollection;
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

        // Check if either the start or end point is within bounds
        const coords = feature.geometry.coordinates;
        const startPoint = coords[0];
        const endPoint = coords[coords.length - 1];

        return isWithinBounds(startPoint[0], startPoint[1]) ||
            isWithinBounds(endPoint[0], endPoint[1]);
    });

    return {
        type: "FeatureCollection",
        features: filteredFeatures
    };
};


export {getZonesForBorough, filterFeaturesByBounds}