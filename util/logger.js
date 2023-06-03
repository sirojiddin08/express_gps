const winston = require('winston');

module.exports = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { date: new Date().toLocaleString() },
    transports: [
        new winston.transports.File({ filename: 'logs.log' }),
    ],
});
