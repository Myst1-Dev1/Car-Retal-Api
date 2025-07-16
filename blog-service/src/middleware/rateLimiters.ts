import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { logger } from "../utils/logger";

const redisClient:any = new Redis(process.env.REDIS_URL!);

// DDoS protection
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "global_middleware",
  points: 10,
  duration: 1,
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter.consume(req.ip!)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
};

// Sensitive endpoints
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req:any, res:any) => {
    logger.warn(`Sensitive endpoint limit hit by IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});