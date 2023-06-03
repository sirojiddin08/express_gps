const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const time = Date.now();
        res.send({ time: time, err: null });
    } catch (error) {
        res.status(400).send({ msg: error.message, status: 0 });
    }
});

module.exports = router; 