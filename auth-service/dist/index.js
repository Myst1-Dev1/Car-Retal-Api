"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./utils/logger");
const rateLimiters_1 = require("./middleware/rateLimiters");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(rateLimiters_1.rateLimiterMiddleware);
app.use("/api/auth/register", rateLimiters_1.sensitiveLimiter);
app.use(errorHandler_1.default);
app.use("/api/auth", auth_routes_1.default);
app.get("/", (req, res) => {
    res.send('Hello world');
});
app.listen(PORT, () => {
    logger_1.logger.info(`Auth service running on port ${PORT}`);
});
