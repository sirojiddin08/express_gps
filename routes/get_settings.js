const express = require('express');
const router = express.Router();
const logger = require('../util/logger.js');
// const { Pool } = require('pg');

// const DB = require('../config/db.js');

// const pool = new Pool(DB);

router.get('/', async (req, res) => {
    try {
        res.send({
            settings:
            {
                send_data:
                {
                    onmove: 1,
                    onstop: 1
                },
                server_time: Date.now(),
                cached_data: 100
            }
        });

    } catch (error) {
        logger.log({ level: 'error', message: { text: error.message, input: req.body} });
        res.status(400).send({ msg: error.message, status: 0 });
    }
});

module.exports = router;