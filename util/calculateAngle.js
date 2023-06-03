
module.exports = function (lat1, lon1, lat2, lon2) {
    const degreesToRadians = Math.PI / 180;

    // Convert latitude and longitude to radians
    const lat1Rad = lat1 * degreesToRadians;
    const lon1Rad = lon1 * degreesToRadians;
    const lat2Rad = lat2 * degreesToRadians;
    const lon2Rad = lon2 * degreesToRadians;

    // Calculate the differences between the two points
    const deltaLon = lon2Rad - lon1Rad;

    // Calculate the angle using the arctan2 function
    const y = Math.sin(deltaLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(
        deltaLon);
    let angleRad = Math.atan2(y, x);

    // Convert the angle from radians to degrees
    angleRad = (angleRad * 180) / Math.PI;

    // Ensure the angle is within the range of 0 to 360 degrees
    if (angleRad < 0) {
        angleRad += 360;
    }

    return Math.floor(angleRad);
}