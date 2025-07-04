import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import errorHandler from "./middleware/errorHandler";
import helmet from "helmet";
import { rateLimiter } from "./middleware/rateLimiters";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(errorHandler);
app.use(rateLimiter);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);

    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req:Request) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err:any, res:Response, next:NextFunction) => {
        logger.error(`Proxy error:`, err);
        res.status(500).json({
            message: `Internal server error`, error : err.message
        });
    }
};

// Rota do auth-service
app.use('/v1/auth', proxy(process.env.AUTH_SERVICE_URL!, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response from Auth Service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

// Rota do user-service
app.use('/v1/user', proxy(process.env.USER_SERVICE_URL!, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => {
    // proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response from User Service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

// Rota do car-service
app.use('/v1/car', proxy(process.env.CAR_SERVICE_URL!, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => {
    // proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response from User Service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

app.get("/health", (_, res) => {
  res.json({ status: "API Gateway is healthy" });
});

app.listen(PORT, () => {
    logger.info(`Api gateway is running on port ${PORT}`);
    // logger.info(`Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Redis url ${process.env.REDIS_URL}`);
});