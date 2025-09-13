import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger";
import { rateLimiterMiddleware, sensitiveLimiter } from "./middleware/rateLimiters";
import errorHandler from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 4002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// app.use(rateLimiterMiddleware);
// app.use("/api/user", sensitiveLimiter);

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send('Hello world');
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT}`);
});