import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger";
import { rateLimiterMiddleware, sensitiveLimiter } from "./middleware/rateLimiters";
import errorHandler from "./middleware/errorHandler";
import blogRoutes from "./routes/blog.routes";

const app = express();
const PORT = process.env.PORT || 4003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(rateLimiterMiddleware);
app.use("/api/blog", sensitiveLimiter);
app.use("/api/blog", blogRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Blog service running on port ${PORT}`);
});