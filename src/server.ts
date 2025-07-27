import express from "express";
import config from "./config";
import cors from "cors";
import type { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "./lib/express_rate_limit";
import router from "./routes";

const app = express();
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV == "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`Cors error: ${origin} is not allowed by CORS`),
        false,
      );
      console.log(`Cors error: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  }),
);
app.use(helmet());
app.use(limiter);
(async () => {
  try {
    app.use("/api/v1", router);

    app.listen(config.PORT, () => {
      console.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server", err);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    console.warn("Server SHUTDOWN");
    process.exit(0);
  } catch (err) {
    console.error("Error during server shutdown", err);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
