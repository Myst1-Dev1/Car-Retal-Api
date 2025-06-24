"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const logger_1 = require("../utils/logger");
const register = async (req, res) => {
    logger_1.logger.info('Registration endpoint hit...');
    try {
        logger_1.logger.info("Register request received", req.body);
        res.status(201).json({ message: "User registered (stub)" });
    }
    catch (error) {
        logger_1.logger.error('Registration error ocurred', error);
        res.status(500).json({
            success: 'false',
            message: 'Internal server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    logger_1.logger.info('Login endpoint hit...');
    try {
        logger_1.logger.info("Register request received", req.body);
        res.status(201).json({ message: "User registered (stub)" });
    }
    catch (error) {
        logger_1.logger.error('Registration error ocurred', error);
        res.status(500).json({
            success: 'false',
            message: 'Internal server error'
        });
    }
};
exports.login = login;
