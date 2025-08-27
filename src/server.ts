import express from "express";
import config from "./config";
import cors from "cors";
import type { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "@/libs/express_rate_limit";
import router from "@/routes";
import { logger } from "@/libs/winston";
import { connectToDatabase, disconnectFromDatabase } from "@/libs/mongoose";
import { Environments } from "@/constants/environment.constants";
import { COMPRESSION_THRESHOLD } from "./constants/app.constants";

const app = express();
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV == Environments.DEVELOPMENT ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`Cors error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.error(`Cors error: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: COMPRESSION_THRESHOLD,
  }),
);
app.use(helmet());
app.use(limiter);
(async () => {
  try {
    await connectToDatabase();
    app.use("/api/v1", router);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start the server!", err);

    if (config.NODE_ENV === Environments.PRODUCTION) {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn("Server Shutdown!");
    process.exit(0);
  } catch (err) {
    logger.error("Error during server shutdown!", err);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
