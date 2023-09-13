const { createClient } = require('@google/maps');
const polyline = require('@mapbox/polyline');

const client = createClient({
    key: 'AIzaSyD3bAbw0ymUCawtxWcIYUKJFz1JuT1x1go', // Replace with your Google Maps API key
});

function decodePolyline(encoded) {
    return polyline.decode(encoded);
}


function getPolylineFromGoogle(start, end, callback) {
    const params = {
        origin: `${start.lat},${start.lng}`,
        destination: `${end.lat},${end.lng}`,
        mode: 'driving',
    };

    client.directions(params, (err, response) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        const route = response.json.routes[0];

        if (route) {
            const coordinates = [];
            for (const leg of route.legs) {
                for (const step of leg.steps) {
                    const decodedPolyline = decodePolyline(step.polyline.points);
                    for (const point of decodedPolyline) {
                        coordinates.push({
                            lat: point[0],
                            lng: point[1],
                        });
                    }
                }
            }

            const duration = route.legs[0].duration.text;
            const distance = route.legs[0].distance.text;

            callback(coordinates, duration, distance);
        } else {
            const error = 1;
            callback(error);
        }
    });
}


module.exports = {
    getPolylineFromGoogle,
};