const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const DB = require('../config/db.js');
const calculateAngle = require('../util/calculateAngle.js');
const schema = require('../util/validate.js');
const logger = require('../util/logger.js');

const DB2 = {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'oxrana_gps',
    application_name: 'UzTracking v3.0'
}

const pool = new Pool(DB);
const pool2 = new Pool(DB2);

// Function to insert data into the first database
async function insertDataIntoFirstDB(req, res, value, formattedDate) {
    try {
        await pool.query(`
            INSERT INTO reports.tracking (device_id, keyword, date_time, speed, angle, battery_level, message, args, lat, lon, ignition) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            ON CONFLICT (device_id) DO UPDATE SET 
            keyword = $2, date_time = $3, speed = $4, angle = $5, battery_level = $6, message = $7, args = $8, lat = $9, lon = $10, ignition = $11;
        `, [
            value.deviceId,
            value.keyword,
            formattedDate,
            value.speed,
            value.angle,
            value.battery_level,
            value.message,
            JSON.stringify(value.args),
            value.lat,
            value.long,
            value.ignition
        ]);

        res.send({ msg: "Data logged successfully", status: 1, isSettings: true });
    } catch (error) {
        logger.log({ level: 'error', message: { text: error.message, input: req.body } });
        res.status(400).send({ msg: error.message, status: 0 });
    }
}

// Function to insert data into the second database
async function insertDataIntoSecondDB(value) {
    try {
        await pool2.query(`
            INSERT INTO gps.tracking (device_id, keyword, date_time, speed, angle, battery_level, message, args, lat, lon, ignition) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
        `, [
            value.deviceId,
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
        ]);
    } catch (error) {
        logger.log({ level: 'error', message: { text: error.message, input: value } });
    }
}

router.post('/', async (req, res) => {
    try {
        const { deviceId, speed, lat, long, dateTime } = req.body;

        // Query the first database for coordinates
        const coordinates = await pool.query(`SELECT lat, lon, angle FROM reports.tracking WHERE device_id = '${deviceId}'`);

        let angle = 0;

        if (coordinates.rows[0]) {
            const oldLat = coordinates.rows[0].lat;
            const oldLon = coordinates.rows[0].lon;

            if (oldLat === lat && oldLon === long) {
                angle = coordinates.rows[0].angle;
            } else {
                angle = calculateAngle(oldLat, oldLon, lat, long);
            }
        }

        const date = new Date(dateTime);
        date.setUTCHours(date.getUTCHours() + 5);
        const formattedDate = date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '+05');

        const validateData = {
            deviceId,
            speed: Math.floor(speed),
            lat,
            long,
            dateTime,
            angle,
            args: { charging: null, altitude: 0, sattelites: 0 }
        };

        const { value, error } = schema.validate(validateData);

        if (error) {
            logger.log({ level: 'error', message: { err_text: error.message, input: req.body } });
            res.status(400).send({ msg: error.message, status: 0 });
        } else {
            await insertDataIntoFirstDB(req, res, value, formattedDate);
            await insertDataIntoSecondDB(value);
            res.send({ msg: "Data logged successfully", status: 1, isSettings: true });
        }
    } catch (error) {
        logger.log({ level: 'error', message: { text: error.message, input: req.body } });
        res.status(400).send({ msg: error.message, status: 0 });
    }
});

module.exports = router;