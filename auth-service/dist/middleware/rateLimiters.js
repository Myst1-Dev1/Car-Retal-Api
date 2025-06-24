"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveLimiter = exports.rateLimiterMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const ioredis_1 = __importDefault(require("ioredis"));
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const logger_1 = require("../utils/logger");
const redisClient = new ioredis_1.default(process.env.REDIS_URL);
// DDoS protection
const rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "global_middleware",
    points: 10,
    duration: 1,
});
const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
        logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    });
};
exports.rateLimiterMiddleware = rateLimiterMiddleware;
// Sensitive endpoints
exports.sensitiveLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn(`Sensitive endpoint limit hit by IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});
