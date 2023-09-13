const express = require('express');
const router = express.Router();
const logger = require('../util/logger.js');
const { getPolylineFromGoogle } = require('../util/googleMapUtills.js');

router.post('/', async (req, res) => {
    try {
        const { start, end } = req.body;
        getPolylineFromGoogle(start, end, (coordinates, duration, distance) => {
            if (coordinates == 1) {
                res.send({ msg: "Ma'lumot topilmadi!", error: true });
            } else {
                res.send({ coordinates, duration, distance, error: false });
            }
        });

    } catch (error) {
        logger.log({ level: 'error', message: { text: error.message, input: req.body } });
        res.status(400).send({ msg: error.message, status: 0 });
    }
});

module.exports = router;