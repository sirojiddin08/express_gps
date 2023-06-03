const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const DB = require('../config/db.js');
const calculateAngle = require('../util/calculateAngle.js');
const schema = require('../util/validate.js');
const logger = require('../util/logger.js');

const pool = new Pool(DB);

router.post('/', async (req, res) => {
    try {
        let angle = 0;
        const { deviceId, speed, lat, long, dateTime } = req.body;
        const cordinates = await pool.query(`SELECT t.lat, t.lon, t.angle FROM reports.tracking t where device_id = '${deviceId}'`);
        if (cordinates.rows[0]) {
            let old_lat = cordinates.rows[0].lat;
            let old_lon = cordinates.rows[0].lon;
            if (old_lat == lat && old_lon == long) {
                angle = cordinates.rows[0].angle;
            } else {
                angle = calculateAngle(old_lat, old_lon, lat, long)
            }
        }

        const validateData = { deviceId, speed: Math.floor(speed), lat, long, dateTime, angle, args: { charging: null, altitude: 0, sattelites: 0 } }
        const { value, error } = schema.validate(validateData);
        if (error) {
            logger.log({ level: 'error', message: error.message });
            res.status(400).send({ msg: error.message, status: 0 });
        } else {
            pool.query(`INSERT INTO reports.tracking (device_id, keyword, date_time, speed, angle, battery_level, message, args, lat, lon, ignition) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (device_id) DO UPDATE SET 
                    keyword = $2, date_time = $3, speed = $4, angle = $5, battery_level = $6, message = $7, args = $8, lat = $9, lon = $10, ignition = $11;`,
                [value.deviceId,
                    value.keyword,
                    value.dateTime,
                    value.speed,
                    value.angle,
                    value.battery_level,
                    value.message,
                    JSON.stringify(value.args),
                    value.lat,
                    value.long,
                    value.ignition
                ], (error) => {
                    if (error) {
                        logger.log({ level: 'error', message: error.message });
                        res.status(400).send({ msg: error.message, status: 0 });
                    } else {
                        res.send({ msg: "Data logged successfully", status: 1, isSettings: true });
                    }
                });
        }
    } catch (error) {
        logger.log({ level: 'error', message: error.message });
        res.status(400).send({ msg: error.message, status: 0 });
    }
});

module.exports = router; 