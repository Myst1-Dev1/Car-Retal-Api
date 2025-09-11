import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { logger } from "../utils/logger";

const redisClient:any = new Redis(process.env.REDIS_URL!);
const WHITELIST = ["192.168.0.186", "127.0.0.1", "172.18.0.9"];

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    skip: (req) => {
        const clientIp = req.ip!.replace("::ffff:", "");
        return WHITELIST.includes(clientIp); // ignora se o IP está na lista
    },
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: 'false', message: 'Too many requests' });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});