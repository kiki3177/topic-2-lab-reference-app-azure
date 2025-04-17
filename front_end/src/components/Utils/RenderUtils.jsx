// Create curved lines between two points
const createCurvedLine = (start, end) => {
    // Calculate midpoint
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;

    // Calculate perpendicular offset for the control point
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Curve factor - adjust this to control the curve's height
    // Shorter lines get more pronounced curves for visibility
    const curveFactor = Math.min(0.2, 0.1 + (0.1 / Math.max(0.1, dist)));

    // Calculate control point with perpendicular offset
    const controlX = midX - dy * curveFactor;
    const controlY = midY + dx * curveFactor;

    // Create a series of points along the quadratic Bezier curve
    const curvePoints = [];
    const steps = 12; // Number of points along the curve

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        // Quadratic Bezier curve formula
        const x = Math.pow(1-t, 2) * start[0] +
            2 * (1-t) * t * controlX +
            Math.pow(t, 2) * end[0];

        const y = Math.pow(1-t, 2) * start[1] +
            2 * (1-t) * t * controlY +
            Math.pow(t, 2) * end[1];

        curvePoints.push([x, y]);
    }

    return curvePoints;
};



const logMapBounds = ({map, setUserWindowBounds}) => {
    if (!map || !map.current) return;
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
    });
    console.log("Map bounds updated:", {
        "topLeft": topLeft,
        "topRight": topRight,
        "bottomLeft": bottomLeft,
        "bottomRight": bottomRight
    });
};


export {createCurvedLine, logMapBounds}