import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger";
import { rateLimiterMiddleware, sensitiveLimiter } from "./middleware/rateLimiters";
import errorHandler from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(rateLimiterMiddleware);
app.use("/api/auth/register", sensitiveLimiter);

app.use(errorHandler);

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});