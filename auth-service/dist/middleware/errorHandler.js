"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
};
exports.default = errorHandler;
