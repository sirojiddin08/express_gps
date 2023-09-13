const Joi = require('joi');

module.exports = Joi.object({
    deviceId: Joi.string().required().min(3),
    keyword: Joi.string().default('0'),
    dateTime: Joi.date().timestamp().required(),
    lat: Joi.number().required().min(-90).max(90),
    long: Joi.number().required().min(-180).max(180),
    ignition: Joi.boolean().default(false),
    speed: Joi.number().required(),
    angle: Joi.number().default(0),
    battery_level: Joi.number().optional().default(0),
    message: Joi.string().default(0),
    args: Joi.object({
        charging: Joi.boolean().optional().allow(null).default(false),
        altitude: Joi.number().optional().default(0),
        sattelites: Joi.number().optional().default(0)
    }).optional().default({})
});
