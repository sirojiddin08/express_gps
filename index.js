const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const port = 3000;

const logger = require('./util/logger.js');
const gps = require('./routes/gps.js');
const get_settings = require('./routes/get_settings.js');


// app.use((req, res, next) => {
//     logger.log({ level: 'info', message: req.body });
//     next();
// });

// Routes
app.use('/log', gps);
app.use('/settings', get_settings)

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});